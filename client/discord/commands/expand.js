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
        
        const title = `Expand`;
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
        const astronomicalObjects = sectorData.astronomicalObjects;  
        let objects = [];
        astronomicalObjects.forEach(o => {
            if (o.ownedBy) {
                if (o.ownedBy._id == userData._id) {
                    objects.push({
                        label: `${o.name}`,
                        description: `Colonies: ${o.colony.length}`,
                        value: `${o.name}`,
                        emoji: emojis.get(o.type)
                    });
                }
            }
        });
        
        if (!objects.length) {
            const sectorEmbed = client.extends.embed();
            sectorEmbed.title = title;
            sectorEmbed.description = `You hold no claim in this sector.`;

            await message.channel.send({
                embeds: [sectorEmbed],
                components: []
            });
            return;
        }
            
        
        let selectedObject = null;

        const objectSelect = client.extends.select({
            id: 'select_object',
            placeHolder: 'Select an astronomical object...',
            options: objects
        });

        const row = client.extends.row().addComponents(objectSelect);

        const msgEmbed = client.extends.embed();
        msgEmbed.title = `Expand`;
        msgEmbed.description = `> You hold \`${objects.length}\` astronomical object(s) in this system.\nAll of which you can reinforce with even more colonies.`;

        msgEmbed.setAuthor({ name: message.author.username, iconURL: message.author.displayAvatarURL() });
        msgEmbed.setThumbnail('https://i.ibb.co/KDGh8m6/6400115.png');

        const colonizeMsg = await message.channel.send({
            embeds: [msgEmbed],
            components: [row]
        });

        const collector = client.extends.collector(colonizeMsg, message.author);

        collector.on('collect', async (i) => {
            switch(i.customId) {
                case "btn_expand": {
                    const returnData = await client.requester.send({
                        method: 'colonize',
                        user: message.member.user,
                        data: {
                            selectedObject
                        }
                    });

                    if (returnData.expansion) {
                        const msgEmbed = client.extends.embed({ color: 'success' });
                        msgEmbed.description = `You successfully reinforced your claim on \`${selectedObject}\`.`;

                        await colonizeMsg.edit({
                            embeds: [msgEmbed], components: []
                        });
                    } else {
                        const msgEmbed = client.extends.embed({ color: 'error' });
                        msgEmbed.description = `It appears that \`${selectedObject}\` has not been colonized yet.\n\nTry doing so first, before expanding your hold on the planet!`;

                        await colonizeMsg.edit({
                            embeds: [msgEmbed], components: []
                        });
                    }
                    break;
                }
                case "select_object": {
                    objectSelect.options.forEach(r => {
                        if (r.value === i.values[0]) r.default = true;
                        else r.default = false;
                    });

                    selectedObject = i.values[0];

                    const btnExpand = client.extends.button({
                        id: 'btn_expand',
                        label: 'Expand',
                        style: 'PRIMARY'
                    });

                    const row2 = client.extends.row().addComponents(btnExpand);

                    await colonizeMsg.edit({
                        components: [row, row2]
                    });
                    break;
                }
            }
        });

    } catch (err) {
        const errorId = await client.errorHandler.send(
            "Expand command",
            err,
            message.guild.name,
            message,
            undefined
        );
        await message.channel.send({
            embeds: [client.extends.errorEmbed("expand", errorId)],
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
    name: "expand",
    category: "Game",
    description: "Construct additional colonies on your planet.",
    usage: "expand",
    rootCmd: false
};