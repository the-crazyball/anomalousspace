exports.run = async (client, message, args, level) => { // eslint-disable-line no-unused-vars
    const settings = message.settings;

    try {
        // help
    } catch (err) {
        const errorId = await client.errorHandler.send(
          "Help command",
          err,
          message.guild.name,
          message,
          undefined
        );
        await message.channel.send({
          embeds: [client.extends.errorEmbed("help", errorId)],
        });
    }

};

exports.conf = {
    enabled: true,
    guildOnly: false,
    aliases: [],
    permLevel: "User",
    requiresAPIConnection: false
};

exports.help = {
    name: "help",
    category: "Game",
    description: "Game help, list of available commands.",
    usage: "help",
    rootCmd: false
};