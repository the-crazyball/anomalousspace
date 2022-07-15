exports.run = async (client, message, args, level) => { // eslint-disable-line no-unused-vars
    const { customEmojis: emojis } = client;

    try {
        const userData = await client.requester.send({
            method: 'getUser',
            user: message.member.user
        });

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

        // we filter out asteroid belts from the display, not needed in this case
        const astronomicalObjects = sectorData.astronomicalObjects.filter(o => o.type !== 'asteroid:belt');

        // now we need to calculate the total asteroids.
        const asteroidBelts = sectorData.astronomicalObjects.filter(o => o.type === 'asteroid:belt');

        let asteroidsCount = 0;

        if (asteroidBelts) {
            asteroidBelts.forEach(b => {
                asteroidsCount += b.asteroidsNum;
            });
        }

        if (stellarObject.class === 'AN') {
            const sectorEmbed = client.extends.embed();
            sectorEmbed.title = title;
            sectorEmbed.description = `WARNING! Scan detected an anomaly in this sector. To further analyze this anomaly you will need to send a drone to get detailed information.

**Position** \`${userData.ship.position.x}\`,\`${userData.ship.position.y}\`,\`${userData.ship.position.z}\``;

            await message.channel.send({
                embeds: [sectorEmbed],
                components: []
            });
            return;
        }

        const description = `> System \`${sectorData.name}\` with a class \`${stellarObject.class}\` star and \`${astronomicalObjects.length}\` astronomical object(s).

${emojis.get('bullet')} **Position** \`${sectorData.x}\`,\`${sectorData.y}\`,\`${sectorData.z}\`
${emojis.get('bullet')} **Asteroids** \`${client.helpers.numberWithCommas(asteroidsCount)}\` from \`${asteroidBelts.length}\` belts

**Astronomical object(s)**
`;

        let objects = [];
        let selectedObject = null;
        let selectedGateway = null;
        let tmpDescription = '';
        let components = [];
        let objectSelect = null;
        let gatewaySelect = null;
        let rowOrbitSelect = null;
        let rowGatewaySelect = null;

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
                    const object = astronomicalObjects.find(o => o.name === selectedObject);

                    let ownedBy = object.ownedBy ? `${object.ownedBy.discordUsername}` : 'Nobody';
                    let isHub = sectorData.isHub && object.type === 'planet:garden' ? `${emojis.get('icon:hub')}` : '';

                    const msgEmbed = client.extends.embed();
                    msgEmbed.title = `${selectedObject} ${isHub}`;
                    msgEmbed.description = `> What shall we do now?

${emojis.get('bullet')} **Population** \`${client.helpers.numberWithCommas(object.population)}\`
${emojis.get('bullet')} **Colonies** \`${object.colony.length}\`
${emojis.get('bullet')} **Owner** \`${ownedBy}\`

**Resources**
${emojis.get('resource:thorium')} Torsium \`${Math.round(object.resources.thorium * 200)}\`
${emojis.get('resource:plutonium')} Plutonium \`${Math.round(object.resources.plutonium * 200)}\`
${emojis.get('resource:uranium')} Uranium \`${Math.round(object.resources.uranium * 200)}\`
${emojis.get('resource:rock')} Rock \`${Math.round(object.resources.rock * 200)}\`
`;

                    msgEmbed.setAuthor({ name: message.author.username, iconURL: message.author.displayAvatarURL() });
                    msgEmbed.setThumbnail('https://i.ibb.co/KDGh8m6/6400115.png');

                    const btnTrade = client.extends.button({
                        id: 'btn_trade',
                        label: 'Trade',
                        style: 'PRIMARY',
                        disabled: object.type === 'planet:garden' ? false : true
                    });

                    let expandable = false;
                    if (object.ownedBy) {
                        expandable = object.ownedBy._id.toString() == userData._id.toString();
                    }
                    const btnExpand = client.extends.button({
                        id: 'btn_expand',
                        label: 'Expand',
                        style: 'PRIMARY',
                        disabled: !expandable
                    });

                    const btnHubGateway = client.extends.button({
                        id: 'btn_hubgate',
                        label: 'Hub Gateway',
                        style: 'PRIMARY'
                    });

                    const components = [];

                    if (isHub) {

                        const row = client.extends.row()
                            .addComponents(btnHubGateway)
                            .addComponents(btnTrade);

                        components.push(row);
                    }
                    if (expandable) {
                        const row = client.extends.row()
                            .addComponents(btnExpand);
                        components.push(row);
                    }

                    await sectorMessage.edit({
                        embeds: [msgEmbed], components: components
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

                        await sectorMessage.edit({
                            embeds: [msgEmbed], components: []
                        });
                    }
                    break;
                }
                case "btn_hubgate": {
                    const gates = [];

                    const hubs = userData.ship.galaxy.hubs;

                    let sortedPoints = [...hubs];

                    // need to sort closest to further to get the closest hub sectors.
                    client.helpers.sortByDistance(sortedPoints, {x: sectorData.x, y: sectorData.y});

                    // get the closest 4 hubs to display, perhaps this could be changed in the future.
                    // Perhaps using a max distance algorithm factored with galaxy size....
                    // 0 is ignored since it's our current location.
                    for (var j = 1; j < 5; j++) {
                        gates.push({
                            label: `Gateway #${j}`,
                            description: `Coordinates: ${sortedPoints[j].x}, ${sortedPoints[j].y}`,
                            value: `${sortedPoints[j].x}|${sortedPoints[j].y}`
                        });
                    }

                    const msgEmbed = client.extends.embed();
                    msgEmbed.title = `${selectedObject} - Gateway`;
                    msgEmbed.description = `> Welcome to the hub gateway system. Each hub sector has it's own network of hubs spanning throughout the galaxy.

**Caution**
> By selecting a entering the hub network, you will be sent to the new sector, some sectors maybe not have a returning gateway.`;

                    msgEmbed.setAuthor({ name: message.author.username, iconURL: message.author.displayAvatarURL() });
                    msgEmbed.setThumbnail('https://i.ibb.co/KDGh8m6/6400115.png');

                    gatewaySelect = client.extends.select({
                        id: 'select_gateways',
                        placeHolder: 'Select a gateway...',
                        options: gates
                    });

                    rowGatewaySelect = client.extends.row().addComponents(gatewaySelect);

                    const gatewayMessage = await message.channel.send({
                        embeds: [msgEmbed], components: [rowGatewaySelect]
                    });

                    const collectorGateway = client.extends.collector(gatewayMessage, message.author);

                    collectorGateway.on('collect', async (i) => {
                        switch(i.customId) {
                            case "select_gateways": {
                                gatewaySelect.options.forEach(r => {
                                    if (r.value === i.values[0]) r.default = true;
                                    else r.default = false;
                                });

                                selectedGateway = i.values[0];

                                const btnEnterGateway = client.extends.button({
                                    id: 'btn_gateway',
                                    label: 'Enter Gateway',
                                    style: 'PRIMARY'
                                });

                                const row = client.extends.row()
                                    .addComponents(btnEnterGateway);

                                await gatewayMessage.edit({
                                    components: [rowGatewaySelect, row]
                                });

                                break;
                            }
                            case "btn_gateway": {
                                const coordinates = selectedGateway.split("|");

                                // get selected gateway coordinates
                                //const hub = userData.ship.galaxy.hubs.find(h => h.x === parseInt(coordinates[0]) && h.y === parseInt(coordinates[1]));

                                await client.requester.send({
                                    method: 'warpTo',
                                    user: message.member.user,
                                    data: {
                                        toCoord: {
                                            x: parseInt(coordinates[0]),
                                            y: parseInt(coordinates[1]),
                                            z: 0
                                        }
                                    }
                                });

                                const msgEmbed1 = client.extends.embed();
                                msgEmbed1.title = `The Threshhold`;
                                msgEmbed1.description = `You approach the gateway just floating in space, your ship enters the threshhold that empty space between the what looks like a ring and nothingness.\n\nYou suddenly have a feeling of déja vue....`;

                                gatewayMessage.edit({
                                    embeds: [msgEmbed1],
                                    components: []
                                }).then(() => {
                                    setTimeout(async () => {
                                        const msgEmbed2 = client.extends.embed();
                                        msgEmbed2.title = `Déja Vue?`;
                                        msgEmbed2.description = `You hear a noise, it's so familiar, another anomaly? Another unknown galaxy?\n\nYou suddenly feel the ship come to a stop...`;

                                        const buttons = client.extends.row()
                                            .addComponents(btnScan)
                                            .addComponents(btnMap)
                                            .addComponents(btnJump);

                                        const lastMessage = await message.channel.send({
                                            embeds: [msgEmbed2],
                                            components: [buttons]
                                        });

                                        const collector = client.extends.collector(lastMessage, message.author);

                                        collector.on('collect', async (i) => {
                                            switch(i.customId) {
                                                case "btn_scan":
                                                    await client.container.commands.get('scan').run(client, message, args, level);
                                                    break;
                                                case "btn_map":
                                                    await client.container.commands.get('map').run(client, message, args, level);
                                                    break;
                                                case "btn_jump":
                                                    await client.container.commands.get('jump').run(client, message, args, level);
                                                    break;
                                            }
                                        });
                                    }, 2000);
                                });
                                break;
                            }
                        }
                    });

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