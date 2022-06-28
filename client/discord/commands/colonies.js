exports.run = async (client, message, args, level) => { // eslint-disable-line no-unused-vars
    const { customEmojis: emojis } = client;

    try {
        let userData = await client.requester.getUser(message.member.user);

        if (!userData.ship) {
            await client.container.commands.get('play').run(client, message, args, level);
            return;
        }

        const colonies = await client.requester.send({
            method: 'getColonies',
            user: message.member.user
        });

        const title = `Colonies`;

        if (!colonies.length) {
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

        const rowPaging = client.extends.row().addComponents(firstButton).addComponents(previousButton).addComponents(blankButton).addComponents(nextButton).addComponents(lastButton);

        const description = `> You currently have \`${colonies.length}\` colonies.\n\n`;

        let tmpDescription = '';

        for (var i = 0; i < colonies.length; i++) {

            tmpDescription += `${emojis.get(colonies[i].type)} **${colonies[i].name}**
**»** Galaxy: \`${colonies[i].sector.galaxy.name}\` (\`${colonies[i].sector.galaxy.x}\`,\`${colonies[i].sector.galaxy.y}\`,\`${colonies[i].sector.galaxy.z}\`)
**»** Sector: \`${colonies[i].sector.name}\` (\`${colonies[i].sector.x}\`,\`${colonies[i].sector.y}\`,\`${colonies[i].sector.z}\`)\n\n`;

            if (i + 1 === pageCount * 10 || i + 1 === colonies.length) {
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
            rowPaging.components[0].disabled = currentPage === 0 ? true : false;
            rowPaging.components[1].disabled = currentPage === 0 ? true : false;
            rowPaging.components[2].disabled = true;
            rowPaging.components[2].label = `Page ${currentPage + 1} of ${pages.length}`;
            rowPaging.components[3].disabled = currentPage === pages.length - 1 ? true : false;
            rowPaging.components[4].disabled = currentPage === pages.length - 1 ? true : false;
        }

        if (currentPage + 1 === pages.length) {
            pages[currentPage].components.pop();
        }
        const coloniesMessage = await message.channel.send(pages[currentPage]);

        const collector = client.extends.collector(coloniesMessage, message.author);

        collector.on('collect', async (i) => {
            if (i.customId === "btn_first") {
                currentPage = 0;

                rowPaging.components[0].disabled = currentPage === 0 ? true : false;
                rowPaging.components[1].disabled = currentPage === 0 ? true : false;
                rowPaging.components[2].label = `Page ${currentPage + 1} of ${pages.length}`;
                rowPaging.components[3].disabled = currentPage === pages.length - 1 ? true : false;
                rowPaging.components[4].disabled = currentPage === pages.length - 1 ? true : false;

                await coloniesMessage.edit(pages[currentPage]);
            }
            if (i.customId === "btn_last") {

                currentPage = pages.length - 1;

                rowPaging.components[0].disabled = false;
                rowPaging.components[1].disabled = false;
                rowPaging.components[2].label = `Page ${currentPage + 1} of ${pages.length}`;
                rowPaging.components[3].disabled = currentPage === pages.length - 1 ? true : false;
                rowPaging.components[4].disabled = currentPage === pages.length - 1 ? true : false;

                await coloniesMessage.edit(pages[currentPage]);
            }
            if (i.customId === "btn_next") {
                currentPage++;

                rowPaging.components[0].disabled = false;
                rowPaging.components[1].disabled = false;
                rowPaging.components[2].label = `Page ${currentPage + 1} of ${pages.length}`;
                rowPaging.components[3].disabled = currentPage === pages.length - 1 ? true : false;
                rowPaging.components[4].disabled = currentPage === pages.length - 1 ? true : false;

                await coloniesMessage.edit(pages[currentPage]);
            }
            if (i.customId === "btn_prev")  {
                currentPage--;

                rowPaging.components[0].disabled = currentPage === 0 ? true : false;
                rowPaging.components[1].disabled = currentPage === 0 ? true : false;
                rowPaging.components[2].label = `Page ${currentPage + 1} of ${pages.length}`;
                rowPaging.components[3].disabled = currentPage === pages.length - 1 ? true : false;
                rowPaging.components[4].disabled = currentPage === pages.length - 1 ? true : false;

                await coloniesMessage.edit(pages[currentPage]);

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