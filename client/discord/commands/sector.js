exports.run = async (client, message, args, level) => { // eslint-disable-line no-unused-vars
    try {
        let userData = await client.requester.getUser(message.member.user);

        if (!userData.ship) {
            await client.container.commands.get('play').run(client, message, args, level);
            return;
        }
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
    usage: "scan",
    rootCmd: false
};