exports.run = async (client, message, args, level) => { // eslint-disable-line no-unused-vars
    const settings = message.settings;

    try {
        // about
    } catch (err) {
        const errorId = await client.errorHandler.send(
          "About command",
          err,
          message.guild.name,
          message,
          undefined
        );
        await message.channel.send({
          embeds: [client.extends.errorEmbed("about", errorId)],
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
    name: "about",
    category: "Game",
    description: "About the game.",
    usage: "about",
    rootCmd: false
};