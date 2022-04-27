exports.run = async (client, message, args, level) => { // eslint-disable-line no-unused-vars
    const settings = message.settings;

    let userData = await client.requester.getUser(message.member.user);

    if (!userData.ship) {
        await client.container.commands.get('play').run(client, message, args, level);
        return
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

    let sectorData = await client.requester.scan(message.member.user, {
        type: 'sector',
        coordinates: {
            x: x,
            y: y,
            z: z
        }
    });

    const title = `System Scan Results`;

    if (!sectorData) {
        const sectorEmbed = client.extends.embed();
        sectorEmbed.title = title;
        sectorEmbed.description = `Scan results detected... nothing of interest in this sector.

**Coordinates** \`${x}\`,\`${y}\`,\`${z}\``;

        await message.channel.send({
            embeds: [sectorEmbed],
            components: []
        });
        return;
    }

    const previousButton = client.extends.button({
        id: 'btn_prev',
        label: '<',
        style: 'PRIMARY'
    })

    const firstButton = client.extends.button({
        id: 'btn_first',
        label: '<<',
        style: 'PRIMARY'
    })

    const nextButton = client.extends.button({
        id: 'btn_next',
        label: '>',
        style: 'PRIMARY'
    })

    const lastButton = client.extends.button({
        id: 'btn_last',
        label: '>>',
        style: 'PRIMARY'
    })

    const blankButton = client.extends.button({
        id: 'btn_blank',
        label: 'Page 1 of 4',
        style: 'SECONDARY',
        disabled: true
    })

    const rowPaging = client.extends.row().addComponents(firstButton).addComponents(previousButton).addComponents(blankButton).addComponents(nextButton).addComponents(lastButton);

    
    const description = `System \`${sectorData.name}\` with a class \`${sectorData.type.class}\` star and \`${sectorData.planets.length}\` astronomical object(s).

**Coordinates** \`${sectorData.coordinates.x}\`,\`${sectorData.coordinates.y}\`,\`${sectorData.coordinates.z}\`

**Faction** \`unknown\`
**Anomalies** \`unknown\`
\u200B    
`;

    let fields = [];

    for (var i = 0; i < sectorData.planets.length; i++) {

        const planetIcon = {
            'Desert': '<:planet_desert:962037563231715338>',
            'Rock': '<:planet_rock:962047597214838914>',
            'Ocean': '<:planet_ocean:962048027953090660>'
        }

        fields.push({
            name: `${sectorData.planets[i].name} ${planetIcon[sectorData.planets[i].type]}`,
            value: `<:bullet2:962045846462029835> Population \`${client.helpers.numberWithCommas(sectorData.planets[i].population)}\`\n<:bullet2:962045846462029835> Satellites \`${sectorData.planets[i].satellites.length}\`\n\n**Resources**\n<:resource_thorium:962030123752759399> Torsium \`${Math.round(sectorData.planets[i].resources.thorium * 200)}\`\n<:resource_plutonium:962030124037963867> Plutonium \`${Math.round(sectorData.planets[i].resources.plutonium * 200)}\`\n<:resource_uranium:962030123824083044> Uranium \`${Math.round(sectorData.planets[i].resources.uranium * 200)}\`\n<:resource_rock2:962029930466668595> Rock \`${Math.round(sectorData.planets[i].resources.rock * 200)}\`\n\n**Owner(s)**\n\`None\``,
            inline: true  
        });

        if (i + 1 === pageCount * 2 || i + 1 === sectorData.planets.length) {
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
    };

    const scanMessage = await message.channel.send(pages[currentPage]);

    const collector = client.extends.collector(scanMessage, message.author);

    collector.on('collect', async (i) => {
        if (i.customId === "btn_first") {
            currentPage = 0;

            rowPaging.components[0].disabled = currentPage === 0 ? true : false;
            rowPaging.components[1].disabled = currentPage === 0 ? true : false;
            rowPaging.components[2].label = `Page ${currentPage + 1} of ${pages.length}`;
            rowPaging.components[3].disabled = currentPage === pages.length - 1 ? true : false;
            rowPaging.components[4].disabled = currentPage === pages.length - 1 ? true : false;

            await scanMessage.edit(pages[currentPage]);
        }
        if (i.customId === "btn_last") {

            currentPage = pages.length - 1;

            rowPaging.components[0].disabled = false;
            rowPaging.components[1].disabled = false;
            rowPaging.components[2].label = `Page ${currentPage + 1} of ${pages.length}`;
            rowPaging.components[3].disabled = currentPage === pages.length - 1 ? true : false;
            rowPaging.components[4].disabled = currentPage === pages.length - 1 ? true : false;

            await scanMessage.edit(pages[currentPage]);
        }
        if (i.customId === "btn_next") {
            currentPage++;

            rowPaging.components[0].disabled = false;
            rowPaging.components[1].disabled = false;
            rowPaging.components[2].label = `Page ${currentPage + 1} of ${pages.length}`;
            rowPaging.components[3].disabled = currentPage === pages.length - 1 ? true : false;
            rowPaging.components[4].disabled = currentPage === pages.length - 1 ? true : false;

            await scanMessage.edit(pages[currentPage]);
        }
        if (i.customId === "btn_prev")  {
            currentPage--;

            rowPaging.components[0].disabled = currentPage === 0 ? true : false;
            rowPaging.components[1].disabled = currentPage === 0 ? true : false;
            rowPaging.components[2].label = `Page ${currentPage + 1} of ${pages.length}`;
            rowPaging.components[3].disabled = currentPage === pages.length - 1 ? true : false;
            rowPaging.components[4].disabled = currentPage === pages.length - 1 ? true : false;

            await scanMessage.edit(pages[currentPage]);

        }
        if (i.customId === "btn_warp") {
            let result = await client.requester.warpStart(message.member.user);

            const warpEmbed1 = client.extends.embed();
            warpEmbed1.title = `The Light`
            warpEmbed1.description = `You enter the warp gate and suddenly feel as if you senses have intensified and see a bright light surrounding you and your ship....`
            
            scanMessage.edit({
                embeds: [warpEmbed1],
                components: []
            })
            .then(() => { // Wait until the first message is sent
                setTimeout(() => {
                    const warpEmbed2 = client.extends.embed();
                    warpEmbed2.title = `An Unexpected Event`;
                    warpEmbed2.description = `Everything is going so fast... You hear something, a noise that you can't identify, you suddenly feel the ship turning out of control...`
            
                    message.channel.send({
                        embeds: [warpEmbed2],
                        components: []
                    })
                    .then(() => {
                        setTimeout(() => {
                            const warpEmbed3 = client.extends.embed();
                            warpEmbed3.title = `Did I die?`;
                            warpEmbed3.description = `You have a feeling that this is it, you are going to die!\n\nBut as soon as your thought of dying ends, the bright light disappears, the ship stops turning and starts difting in space.\n\nYou look around to get your bearings to see where you are...`
                            //warpEmbed3.addField('Current Location', `\`Unknown\` Sector \`Unknown\``, true)

                            const dieMessage = message.channel.send({
                                embeds: [warpEmbed3],
                                components: []
                            })


                        }, 2000)
                    })
                }, 2000)
            })


            console.log(result)
        }
    });
    collector.on("end", (collectors, reason) => {
    });
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