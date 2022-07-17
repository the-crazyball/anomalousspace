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

        const planets = await client.requester.send({
            method: 'getColonies',
            user: message.member.user
        });

        const title = `Colonies`;

        if (!planets.length) {
            const sectorEmbed = client.extends.embed();
            sectorEmbed.title = title;
            sectorEmbed.description = `You don't have any colonies at this time.`;

            await message.channel.send({
                embeds: [sectorEmbed],
                components: []
            });
            return;
        }

        let currentPage = 0;
        let pages = [];
        let pageCount = 1;

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

        const rowPaging = client.extends.row()
            .addComponents(firstButton)
            .addComponents(previousButton)
            .addComponents(blankButton)
            .addComponents(nextButton)
            .addComponents(lastButton);
           
        let colonyAmount = 0
        planets.forEach((element) => {
            colonyAmount += element.colony.length
        });
        const description = `> You currently have \`${colonyAmount}\` colon${colonyAmount == 1 ? "y" : "ies"}.\n\n`;

        let tmpDescription = '';

        for (var i = 0; i < planets.length; i++) {

            tmpDescription += `${emojis.get(planets[i].type)} **${planets[i].name}** (**Colonies: ${planets[i].colony.length}**)
**»** Galaxy: \`${planets[i].sector.galaxy.name}\` (\`${planets[i].sector.galaxy.x}\`,\`${planets[i].sector.galaxy.y}\`,\`${planets[i].sector.galaxy.z}\`)
**»** Sector: \`${planets[i].sector.name}\` (\`${planets[i].sector.x}\`,\`${planets[i].sector.y}\`,\`${planets[i].sector.z}\`)\n\n`;

            if (i + 1 === pageCount * 10 || i + 1 === planets.length) {
                let components = [];

                const msgEmbed = client.extends.embed();
                msgEmbed.title = title;
                msgEmbed.description = description;
                msgEmbed.description += tmpDescription;
                msgEmbed.setAuthor({ name: message.author.username, iconURL: message.author.displayAvatarURL() });
                msgEmbed.setThumbnail('https://i.ibb.co/KDGh8m6/6400115.png');

                components.push(rowPaging);

                const page = {
                    embeds: [msgEmbed],
                    components: components
                };

                pageCount++;
                pages.push(page);
                tmpDescription = '';
            }
            rowPaging.components[0].disabled = currentPage == 0;
            rowPaging.components[1].disabled = currentPage == 0;
            rowPaging.components[2].disabled = true;
            rowPaging.components[2].label = `Page ${currentPage + 1} of ${pages.length}`;
            rowPaging.components[3].disabled = currentPage == pages.length - 1;
            rowPaging.components[4].disabled = currentPage == pages.length - 1;
        }

        if (currentPage + 1 === pages.length) {
            pages[currentPage].components.pop();
        }
        const coloniesMessage = await message.channel.send(pages[currentPage]);

        const collector = client.extends.collector(coloniesMessage, message.author);
        
        const updatePaging = async () => {
            rowPaging.components[0].disabled = currentPage == 0;
            rowPaging.components[1].disabled = currentPage == 0;
            rowPaging.components[2].label = `Page ${currentPage + 1} of ${pages.length}`;
            rowPaging.components[3].disabled = currentPage == pages.length - 1;
            rowPaging.components[4].disabled = currentPage == pages.length - 1;
            await coloniesMessage.edit(pages[currentPage]);
        }
        collector.on('collect', async (i) => {
            switch(i.customId) {
                case "btn_first":
                    currentPage = 0;
                    await updatePaging()
                    break;
                case "btn_last":
                    currentPage = pages.length - 1;
                    await updatePaging()
                    break;
                case "btn_next":
                    currentPage++;
                    await updatePaging()
                    break;
                case "btn_prev":
                    currentPage--;
                    await updatePaging()
                    break;
            }
        });
    } catch (err) {
        const errorId = await client.errorHandler.send(
            "Colonies command",
            err,
            message.guild.name,
            message,
            undefined
        );
        await message.channel.send({
            embeds: [client.extends.errorEmbed("colonies", errorId)],
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
    name: "colonies",
    category: "Game",
    description: "View a list of all your colonies.",
    usage: "colonies",
    rootCmd: false
};