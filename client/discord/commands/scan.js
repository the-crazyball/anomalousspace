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

        let currentPage = 0;
        let pages = [];
        let pageCount = 1;

        // using args from the command entered for coordinates to scan
        // example: 23 56 0 (x, y, z)
        // note that z is not used is always 0 at the moment, for future expansion

        if (args[0] && (!client.helpers.isInteger(args[0]) || !client.helpers.isInteger(args[1]))) return;

        const x = args[0] || null;
        const y = args[1] || null;
        const z = 0;

        const sectorData = await client.requester.send({
            method: 'scan',
            user: message.member.user,
            data: {
                type: 'sector',
                coordinates: {
                    x: x,
                    y: y,
                    z: z
                }
            }
        });

        const title = `System Scan Results`;

        if (!sectorData.stellarObjects.length) {
            const sectorEmbed = client.extends.embed();
            sectorEmbed.title = title;
            sectorEmbed.description = `Scan results detected... nothing of interest in this sector.

**Position** \`${userData.ship.position.x}\`,\`${userData.ship.position.y}\`,\`${userData.ship.position.z}\``;

            await message.channel.send({
                embeds: [sectorEmbed],
                components: []
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
            sectorEmbed.description = `WARNING! Scan detected and anomaly in this sector. To further analyze this anomaly you will need to send a drone to get detailed information.

**Position** \`${userData.ship.position.x}\`,\`${userData.ship.position.y}\`,\`${userData.ship.position.z}\``;

            await message.channel.send({
                embeds: [sectorEmbed],
                components: []
            });
            return;
        }

        const previousButton = client.extends.button({
            id: 'btn_prev',
            label: '<',
            style: 'SECONDARY'
        });

        const firstButton = client.extends.button({
            id: 'btn_first',
            label: '<<',
            style: 'SECONDARY'
        });

        const nextButton = client.extends.button({
            id: 'btn_next',
            label: '>',
            style: 'SECONDARY'
        });

        const lastButton = client.extends.button({
            id: 'btn_last',
            label: '>>',
            style: 'SECONDARY'
        });

        const blankButton = client.extends.button({
            id: 'btn_blank',
            label: 'Page 1 of 4',
            style: 'PRIMARY',
            disabled: true
        });

        const rowPaging = client.extends.row().addComponents(firstButton).addComponents(previousButton).addComponents(blankButton).addComponents(nextButton).addComponents(lastButton);

        const description = `System \`${sectorData.name}\` with a class \`${stellarObject.class}\` star and \`${astronomicalObjects.length}\` astronomical object(s).

**Position** \`${sectorData.x}\`,\`${sectorData.y}\`,\`${sectorData.z}\`

**Faction** \`unknown\`
**Anomalies** \`unknown\`

**Asteroids** \`${client.helpers.numberWithCommas(asteroidsCount)}\` from \`${asteroidBelts.length}\` belts
\u200B`;

        let fields = [];

        if (astronomicalObjects.length) {
            for (var i = 0; i < astronomicalObjects.length; i++) {

                let ownedBy = astronomicalObjects[i].ownedBy ? `${astronomicalObjects[i].ownedBy.discordUsername}` : 'Nobody';

                fields.push({
                    name: `${astronomicalObjects[i].name}`,
                    value: `${emojis.get('bullet')} Population \`${client.helpers.numberWithCommas(astronomicalObjects[i].population)}\`\n${emojis.get('bullet')} Satellites \`${astronomicalObjects[i].satellites.length}\`\n${emojis.get('bullet')} Colonies \`${astronomicalObjects[i].colony.length}\`\n\n**Resources**\n${emojis.get('resource:thorium')} Torsium \`${Math.round(astronomicalObjects[i].resources.thorium * 200)}\`\n${emojis.get('resource:plutonium')} Plutonium \`${Math.round(astronomicalObjects[i].resources.plutonium * 200)}\`\n${emojis.get('resource:uranium')} Uranium \`${Math.round(astronomicalObjects[i].resources.uranium * 200)}\`\n${emojis.get('resource:rock')} Rock \`${Math.round(astronomicalObjects[i].resources.rock * 200)}\`\n\n**Owner**\n\`${ownedBy}\``,
                    inline: true
                });

                if (i + 1 === pageCount * 2 || i + 1 === astronomicalObjects.length) {
                    let components = [];

                    const sectorEmbed = client.extends.embed();
                    sectorEmbed.title = title;
                    sectorEmbed.description = description;
                    //sectorEmbed.description += `\n\nPage \`${pageCount} of ${~~(sectorData.planets.length / 2)}\``;
                    sectorEmbed.fields = fields;

                    components.push(rowPaging);

                    const page = {
                        embeds: [sectorEmbed],
                        components: components
                    };

                    pageCount++;
                    pages.push(page);
                    fields = [];
                }
                rowPaging.components[0].disabled = currentPage === 0 ? true : false;
                rowPaging.components[1].disabled = currentPage === 0 ? true : false;
                rowPaging.components[2].disabled = true;
                rowPaging.components[2].label = `Page ${currentPage + 1} of ${pages.length}`;
                rowPaging.components[3].disabled = currentPage === pages.length - 1 ? true : false;
                rowPaging.components[4].disabled = currentPage === pages.length - 1 ? true : false;
            }
        } else {
            const sectorEmbed = client.extends.embed();
            sectorEmbed.title = title;
            sectorEmbed.description = description;
            const page = {
                embeds: [sectorEmbed],
                components: []
            };
            pages.push(page);
        }

        const scanMessage = await message.channel.send(pages[currentPage]);

        const collector = client.extends.collector(scanMessage, message.author);

        collector.on('collect', async (i) => {
            switch(i.customId) {
                case "btn_first":
                    currentPage = 0;

                    rowPaging.components[0].disabled = currentPage === 0 ? true : false;
                    rowPaging.components[1].disabled = currentPage === 0 ? true : false;
                    rowPaging.components[2].label = `Page ${currentPage + 1} of ${pages.length}`;
                    rowPaging.components[3].disabled = currentPage === pages.length - 1 ? true : false;
                    rowPaging.components[4].disabled = currentPage === pages.length - 1 ? true : false;

                    await scanMessage.edit(pages[currentPage]);
                    break;

                case "btn_last":

                    currentPage = pages.length - 1;

                    rowPaging.components[0].disabled = false;
                    rowPaging.components[1].disabled = false;
                    rowPaging.components[2].label = `Page ${currentPage + 1} of ${pages.length}`;
                    rowPaging.components[3].disabled = currentPage === pages.length - 1 ? true : false;
                    rowPaging.components[4].disabled = currentPage === pages.length - 1 ? true : false;

                    await scanMessage.edit(pages[currentPage]);
                    break;

                case "btn_next":
                    currentPage++;

                    rowPaging.components[0].disabled = false;
                    rowPaging.components[1].disabled = false;
                    rowPaging.components[2].label = `Page ${currentPage + 1} of ${pages.length}`;
                    rowPaging.components[3].disabled = currentPage === pages.length - 1 ? true : false;
                    rowPaging.components[4].disabled = currentPage === pages.length - 1 ? true : false;

                    await scanMessage.edit(pages[currentPage]);
                    break;

                case "btn_prev":
                    currentPage--;

                    rowPaging.components[0].disabled = currentPage === 0 ? true : false;
                    rowPaging.components[1].disabled = currentPage === 0 ? true : false;
                    rowPaging.components[2].label = `Page ${currentPage + 1} of ${pages.length}`;
                    rowPaging.components[3].disabled = currentPage === pages.length - 1 ? true : false;
                    rowPaging.components[4].disabled = currentPage === pages.length - 1 ? true : false;

                    await scanMessage.edit(pages[currentPage]);
                    break;
            }
        });
    } catch (err) {
        const errorId = await client.errorHandler.send(
            "Scan command",
            err,
            message.guild.name,
            message,
            undefined
        );
        await message.channel.send({
            embeds: [client.extends.errorEmbed("scan", errorId)],
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
    name: "scan",
    category: "Game",
    description: "Sector scan.",
    usage: "scan",
    rootCmd: false
};