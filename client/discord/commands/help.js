exports.run = async (client, message, args, level) => { // eslint-disable-line no-unused-vars
    const settings = message.settings;
    const { customEmojis: emojis, container } = client;

    try {
        // help

        if (!args[0]) {
            const helpEmbed = client.extends.embed();
            helpEmbed.title = `Help`;
            helpEmbed.description = `> You will find all the commands to play the game, to get more information about a specific command type \`${message.settings.prefix} help {command}\`.

New to Anomalous Space type \`${message.settings.prefix} play\``;

            helpEmbed.addField('Gameplay', `\`scan\`, \`jump\`, \`warp\`, \`map\`, \`coordinates\`, \`leaderboard\`, \`about\``, false);
            helpEmbed.addField('Links', `${emojis.get('bullet')} [Website](${client.config.website})\n${emojis.get('bullet')} [Play & Support Server](${client.config.supportServer})`, false);

            helpEmbed.setAuthor({ name: client.user.username, iconURL: client.user.displayAvatarURL() })
            helpEmbed.setThumbnail('https://i.ibb.co/KDGh8m6/6400115.png');
            helpEmbed.setFooter({ text: `${client.config.copyright}` });

            await message.channel.send({ embeds: [helpEmbed] });
        } else {
            // Show individual command's help.
            let command = args[0];
            if (container.commands.has(command) || container.commands.has(container.aliases.get(command))) {
                command = container.commands.get(command) ?? container.commands.get(container.aliases.get(command));

                if (level < container.levelCache[command.conf.permLevel]) return;
                
                const helpEmbed = client.extends.embed();
                helpEmbed.title = `${client.helpers.toProperCase(command.help.name)} Help`;
                helpEmbed.description = `> ${command.help.description}

**Usage** \`${settings.prefix} ${command.help.usage}\`

**Aliases** ${command.conf.aliases.length ? command.conf.aliases.map(alias => `\`${alias}\``).join(', ') : 'none'}`;

                helpEmbed.setAuthor({ name: client.user.username, iconURL: client.user.displayAvatarURL() })
                helpEmbed.setThumbnail('https://i.ibb.co/KDGh8m6/6400115.png');
                helpEmbed.setFooter({ text: `${client.config.copyright}` });
                await message.channel.send({ embeds: [helpEmbed] });
            }
        }
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