exports.run = async (client, message, args, level) => { // eslint-disable-line no-unused-vars
    const settings = message.settings;
    const { customEmojis: emojis } = client;

    try {
        // about

        const aboutEmbed = client.extends.embed();
        aboutEmbed.title = `About Anomalous Space`;
        aboutEmbed.description = `> Explore a vast procedurally generated universe with millions of planets, stars and resources to conquer while avoiding or finding what these unknown anomalies are all about!`;

        aboutEmbed.addField('Contributors', `\`Surfside\`, \`Vraboros\``, true);
        aboutEmbed.addField('Testers', `\`Surfside\`, \`Vraboros\``, true);

        aboutEmbed.addField('Developers', `\`Torsin\``, false);

        aboutEmbed.addField('Links', `${emojis.get('bullet')} [Website](${client.config.website})\n${emojis.get('bullet')} [Play & Support Server](${client.config.supportServer})`, false);

        aboutEmbed.setThumbnail('https://i.ibb.co/KDGh8m6/6400115.png');
        aboutEmbed.setFooter({ text: `${client.config.copyright}` });

        await message.channel.send({ embeds: [aboutEmbed] });

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
    requiresAPIConnection: false
};

exports.help = {
    name: "about",
    category: "Game",
    description: "About the game.",
    usage: "about",
    rootCmd: false
};