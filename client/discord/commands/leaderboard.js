exports.run = async (client, message, args, level) => { // eslint-disable-line no-unused-vars
    try {
        // leaderboard

        let userData = await client.requester.getUser(message.member.user);

        if (!userData.ship) {
            await client.container.commands.get('play').run(client, message, args, level);
            return;
        }

        const lbEmbed = client.extends.embed();
        lbEmbed.title = 'Leaderboards';
        lbEmbed.description = `> Get to see where you stand with the other lost space travellers scattered throughout the universe.\n\nSelect a \`filter\` below to compare your standings.`;

        lbEmbed.setThumbnail('https://i.ibb.co/KDGh8m6/6400115.png');
        lbEmbed.setFooter({ text: `${client.config.copyright}` });

        const filterSelect = client.extends.select({
            id: 'select_filter',
            placeHolder: 'Filter by...',
            options: [
                {
                    label: `Top Miners`,
                    value: `mining`
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

                let counter = 1;

                if (i.values[0] === 'mining') {
                    lbEmbed.description += `\n\n**Top Miners**\n`;

                    returnData.forEach(u => {
                        lbEmbed.description += `**${counter}** - ${u.me ? ':star: ' : ''}${u.name} - mined \`${u.value}\` times.\n`;
                        counter++;
                    });
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