exports.run = async (client, message, args, level) => { // eslint-disable-line no-unused-vars
    const settings = message.settings;

    try {
        // leaderboard

        let userData = await client.requester.getUser(message.member.user);

        if (!userData.ship) {
            await client.container.commands.get('play').run(client, message, args, level);
            return
        }

        const lbEmbed = client.extends.embed();
        lbEmbed.title = 'The Leaderboard'
        lbEmbed.description = `place holeder for now. To be added, player, credits, alliances, mining, battles...`;

        lbEmbed.setThumbnail('https://i.ibb.co/KDGh8m6/6400115.png');
        lbEmbed.setFooter({ text: `${client.config.copyright}` });

        await message.channel.send({ embeds: [lbEmbed] });
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