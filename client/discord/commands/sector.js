exports.run = async (client, message, args, level) => { // eslint-disable-line no-unused-vars
    const { customEmojis: emojis } = client;

    try {
        let userData = await client.requester.getUser(message.member.user);

        if (!userData.ship) {
            await client.container.commands.get('play').run(client, message, args, level);
            return;
        }

        const { sector: sectorData, scanned } = await client.requester.send({
            method: 'getSector',
            user: message.member.user
        });

        const btnScan = client.extends.button({
            id: 'btn_scan',
            label: 'Scan Sector',
            style: 'PRIMARY'
        });

        const btnJump = client.extends.button({
            id: 'btn_jump',
            label: 'Jump',
            style: 'PRIMARY'
        });

        const btnMap = client.extends.button({
            id: 'btn_map',
            label: 'Map',
            style: 'PRIMARY'
        });

        const title = `Sector`;

        if (!scanned) {
            const sectorEmbed = client.extends.embed();
            sectorEmbed.title = title;
            sectorEmbed.description = `Cannot display sector until a \`scan\` has been completed.`;

            const buttons = client.extends.row()
                .addComponents(btnScan);

            const sectorMessage = await message.channel.send({
                embeds: [sectorEmbed],
                components: [buttons]
            });

            const collector = client.extends.collector(sectorMessage, message.author);

            collector.on('collect', async (i) => {
                switch(i.customId) {
                    case "btn_scan":
                        await client.container.commands.get('scan').run(client, message, args, level);
                        break;
                }
            });
            return;
        }

        if (!sectorData.stellarObjects.length) {
            const sectorEmbed = client.extends.embed();
            sectorEmbed.title = title;
            sectorEmbed.description = `There is nothing of interest in this sector, just empty space!

You can \`jump\` to another sector or \`scan\` the sector again.`;

            const buttons = client.extends.row()
                .addComponents(btnScan)
                .addComponents(btnJump)
                .addComponents(btnMap);

            const sectorMessage = await message.channel.send({
                embeds: [sectorEmbed],
                components: [buttons]
            });

            const collector = client.extends.collector(sectorMessage, message.author);

            collector.on('collect', async (i) => {
                switch(i.customId) {
                    case "btn_scan":
                        await client.container.commands.get('scan').run(client, message, args, level);
                        break;
                    case "btn_jump":
                        await client.container.commands.get('jump').run(client, message, args, level);
                        break;
                    case "btn_map":
                        await client.container.commands.get('map').run(client, message, args, level);
                        break;
                }
            });
            return;
        }

        const stellarObject = sectorData.stellarObjects[0]; // TODO there is only 1 stellar object at the moment, change to have more later.
        const astronomicalObjects = sectorData.astronomicalObjects;

        if (stellarObject.class === 'AN') {
            const sectorEmbed = client.extends.embed();
            sectorEmbed.title = title;
            sectorEmbed.description = `WARNING! Scan detected and anomaly in this sector. To further analyze this anomaly you will need to send a drone to get detailed information.

**Position** \`${userData.ship.position.x}\`,\`${userData.ship.position.y}\`,\`${userData.ship.position.z}\``;

            await message.channel.send({
                embeds: [sectorEmbed],
                components: []
            });
            return;
        }

        const description = `> System \`${sectorData.name}\` with a class \`${stellarObject.class}\` star and \`${astronomicalObjects.length}\` astronomical object(s).

${emojis.get('bullet')} **Position** \`${sectorData.x}\`,\`${sectorData.y}\`,\`${sectorData.z}\`
${emojis.get('bullet')} **Asteroids** \`${client.helpers.numberWithCommas(sectorData.asteroids)}\`

**Astronomical object(s)**
`;

        let objects = [];
        let selectedObject = null;
        let tmpDescription = '';
        let components = [];
        let objectSelect = null;
        let rowOrbitSelect = null;

        if (astronomicalObjects.length) {
            for (var i = 0; i < astronomicalObjects.length; i++) {

                let ownedBy = astronomicalObjects[i].ownedBy ? `[O] \`${astronomicalObjects[i].ownedBy.discordUsername}\`` : '';
                let isHub = sectorData.isHub && astronomicalObjects[i].type === 'planet:garden' ? `[H] ${emojis.get('icon:hub')}` : '';

                tmpDescription += `${emojis.get(astronomicalObjects[i].type)} \`${astronomicalObjects[i].name}\` ${isHub} [R] ${emojis.get('resource:thorium')} ${emojis.get('resource:plutonium')} ${emojis.get('resource:uranium')} ${emojis.get('resource:rock')} ${ownedBy}\n`;

                objects.push({
                    label: `${astronomicalObjects[i].name}`,
                    description: `Population: ${astronomicalObjects[i].population}`,
                    value: `${astronomicalObjects[i].name}`,
                    emoji: emojis.get(astronomicalObjects[i].type)
                });
            }

            objectSelect = client.extends.select({
                id: 'select_object',
                placeHolder: 'Select an astronomical object...',
                options: objects
            });

            rowOrbitSelect = client.extends.row().addComponents(objectSelect);

            components.push(rowOrbitSelect);
        } else {
            tmpDescription += `Nothing`;
        }

        const sectorEmbed = client.extends.embed();
        sectorEmbed.title = title;
        sectorEmbed.description = description;
        sectorEmbed.description += tmpDescription;
        sectorEmbed.setAuthor({ name: message.author.username, iconURL: message.author.displayAvatarURL() });
        sectorEmbed.setThumbnail('https://i.ibb.co/KDGh8m6/6400115.png');

        const sectorMessage = await message.channel.send({
            embeds: [sectorEmbed],
            components: components
        });

        const collector = client.extends.collector(sectorMessage, message.author);

        collector.on('collect', async (i) => {
            switch(i.customId) {
                case "select_object": {
                    objectSelect.options.forEach(r => {
                        if (r.value === i.values[0]) r.default = true;
                        else r.default = false;
                    });

                    selectedObject = i.values[0];

                    const object = astronomicalObjects.find(o => o.name === selectedObject);

                    const btnColonize = client.extends.button({
                        id: 'btn_colonize',
                        label: 'Colonize',
                        style: 'PRIMARY',
                        disabled: !object.ownedBy ? false : true
                    });
                    const btnTrade = client.extends.button({
                        id: 'btn_trade',
                        label: 'Trade',
                        style: 'PRIMARY',
                        disabled: object.type === 'planet:garden' ? false : true
                    });
                    const btnAttack = client.extends.button({
                        id: 'btn_attack',
                        label: 'Attack',
                        style: 'DANGER',
                        disabled: true
                    });
                    const btnVisit = client.extends.button({
                        id: 'btn_visit',
                        label: 'Visit',
                        style: 'PRIMARY'
                    });

                    const row3 = client.extends.row()
                        .addComponents(btnVisit)
                        .addComponents(btnColonize)
                        .addComponents(btnTrade)
                        .addComponents(btnAttack);

                    await sectorMessage.edit({
                        components: [rowOrbitSelect, row3]
                    });
                    break;
                } 
                case "btn_visit": {
                    const msgEmbed = client.extends.embed();
                    msgEmbed.description = `You are currently visiting \`${selectedObject}\` what shall we do now?`;

                    await sectorMessage.edit({
                        embeds: [msgEmbed], components: []
                    });
                    break;
                }
                case "btn_colonize": {
                    const returnData = await client.requester.send({
                        method: 'colonize',
                        user: message.member.user,
                        data: {
                            selectedObject
                        }
                    });

                    if (returnData.colonized) {
                        const msgEmbed = client.extends.embed({ color: 'success' });
                        msgEmbed.description = `You successfully colonized \`${selectedObject}\`.`;

                        await sectorMessage.edit({
                            embeds: [msgEmbed], components: []
                        });
                    }
                    break;
                }
            }
        });

    } catch (err) {
        const errorId = await client.errorHandler.send(
            "Sector command",
            err,
            message.guild.name,
            message,
            undefined
        );
        await message.channel.send({
            embeds: [client.extends.errorEmbed("sector", errorId)],
        });
    }
};

exports.conf = {
    enabled: true,
    guildOnly: false,
    aliases: [],
    permLevel: "User",
    requiresAPIConnection: true
};

exports.help = {
    name: "sector",
    category: "Game",
    description: "Sector information and details. You can also colonize and do resource gathering from here.",
    usage: "sector",
    rootCmd: false
};