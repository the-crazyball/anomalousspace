exports.run = async (client, message, args, level) => { // eslint-disable-line no-unused-vars
    const settings = message.settings;

    try {
        // help

        const helpEmbed = client.extends.embed();
        helpEmbed.title = `Help`;
        helpEmbed.description = `> You will find all the commands to play the game, to gain more help on a specific command use \`${message.settings.prefix} help {command}\`.`;

        
        helpEmbed.setThumbnail('https://i.ibb.co/KDGh8m6/6400115.png');
        helpEmbed.setFooter({ text: `${client.config.copyright}` });

        await message.channel.send({ embeds: [helpEmbed] });
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