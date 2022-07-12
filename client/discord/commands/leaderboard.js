exports.run = async (client, message, args, level) => { // eslint-disable-line no-unused-vars
    try {
        // leaderboard

        let userData = await client.requester.getUser(message.member.user);

        if (!userData.ship) {
            await client.container.commands.get('play').run(client, message, args, level);
            return;
        }

        const title = 'Leaderboards';
        const desc = `> Get to see where you stand with the other lost space travellers scattered throughout the universe.\n\nSelect a \`filter\` below to compare your standings.`;

        const lbEmbed = client.extends.embed();
        lbEmbed.title = title;
        lbEmbed.description = desc;

        lbEmbed.setThumbnail('https://i.ibb.co/KDGh8m6/6400115.png');

        const filterSelect = client.extends.select({
            id: 'select_filter',
            placeHolder: 'Filter by...',
            options: [
                {
                    label: `Top Miners`,
                    value: `mining`
                },
                {
                    label: `Top Scanners`,
                    value: `scans`
                },
                {
                    label: `Top Jumpers`,
                    value: `jumps`
                },
                {
                    label: `Top System Discoverers`,
                    value: `discoveredSystems`
                },
                {
                    label: `Top Sector Discoverers`,
                    value: `discoveredSectors`
                },
                {
                    label: `Top Colonizers`,
                    value: `colonies`
                }
            ]
        });

        const row = client.extends.row().addComponents(filterSelect);

        const lbMsg = await message.channel.send({ embeds: [lbEmbed], components: [row] });

        const collector = client.extends.collector(lbMsg, message.author);

        collector.on('collect', async (i) => {
            if (i.customId === "select_filter") {
                filterSelect.options.forEach(r => {
                    if (r.value === i.values[0]) r.default = true;
                    else r.default = false;
                });

                const returnData = await client.requester.send({
                    method: 'getLeaderboard',
                    user: message.member.user,
                    data: {
                        filter: i.values[0]
                    }
                });

                lbEmbed.title = title;
                lbEmbed.description = desc;

                let counter = 1;

                switch(i.values[0]) {
                    case 'mining':
                        lbEmbed.description += `\n\n**Top Miners**\n`;

                        returnData.forEach(u => {
                            lbEmbed.description += `**${counter}** - ${u.me ? ':star: ' : ''}${u.name} - mined \`${u.value}\` times.\n`;
                            counter++;
                        });
                        break;

                    case 'scans':
                        lbEmbed.description += `\n\n**Top Scanners**\n`;

                        returnData.forEach(u => {
                            lbEmbed.description += `**${counter}** - ${u.me ? ':star: ' : ''}${u.name} - scanned \`${u.value}\` times.\n`;
                            counter++;
                        });
                        break;

                    case 'jumps':
                        lbEmbed.description += `\n\n**Top Jumpers**\n`;

                        returnData.forEach(u => {
                            lbEmbed.description += `**${counter}** - ${u.me ? ':star: ' : ''}${u.name} - jumped \`${u.value}\` times.\n`;
                            counter++;
                        });
                        break;

                    case 'discoveredSystems':
                        lbEmbed.description += `\n\n**Top System Discoverers**\n`;

                        returnData.forEach(u => {
                            lbEmbed.description += `**${counter}** - ${u.me ? ':star: ' : ''}${u.name} - discovered \`${u.value}\` systems.\n`;
                            counter++;
                        });
                        break;

                    case 'discoveredSectors':
                        lbEmbed.description += `\n\n**Top Sector Discoverers**\n`;

                        returnData.forEach(u => {
                            lbEmbed.description += `**${counter}** - ${u.me ? ':star: ' : ''}${u.name} - discovered \`${u.value}\` sectors.\n`;
                            counter++;
                        });
                        break;

                    case 'colonies':
                        lbEmbed.description += `\n\n**Top Colonizers**\n`;

                        returnData.forEach(u => {
                            lbEmbed.description += `**${counter}** - ${u.me ? ':star: ' : ''}${u.name} - colonized \`${u.value}\` planets.\n`;
                            counter++;
                        });
                        break;
                }
                await lbMsg.edit({
                    embeds: [lbEmbed],
                    components: [row]
                });
            }
        });
    } catch (err) {
        const errorId = await client.errorHandler.send(
            "Leaderboard command",
            err,
            message.guild.name,
            message,
            undefined
        );
        await message.channel.send({
            embeds: [client.extends.errorEmbed("leaderboard", errorId)],
        });
    }

};

exports.conf = {
    enabled: true,
    guildOnly: false,
    aliases: ['lb'],
    permLevel: "User",
    requiresAPIConnection: true
};

exports.help = {
    name: "leaderboard",
    category: "Game",
    description: "Shows leaderboard for players, alliances and galaxy related numbers.",
    usage: "leaderboard",
    rootCmd: false
};