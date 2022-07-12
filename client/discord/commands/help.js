exports.run = async (client, message, args, level) => { // eslint-disable-line no-unused-vars
    const settings = message.settings;
    const { container } = client;

    try {
        // help

        if (!args[0]) {
            const helpEmbed = client.extends.embed();
            helpEmbed.title = `Help`;
            helpEmbed.description = `> You will find all the commands to play the game, to get more information about a specific command type \`${message.settings.prefix} help {command}\`.

New to Anomalous Space type \`${message.settings.prefix} play\``;

            helpEmbed.addField('Your Information', `\`user\``, false);
            helpEmbed.addField('Ship', `\`ship\`, \`cargo\``, false);
            helpEmbed.addField('Movement and Exploration', `\`jump\`, \`warp\`, \`scan\`, \`map\`, \`sector\``, false);
            helpEmbed.addField('Mining', `\`mine\``, false);
            helpEmbed.addField('Colonies', `\`colonies\`, \`colonize\``, false);
            helpEmbed.addField('Extra Information', `\`coordinates\`, \`leaderboard\`, \`info\`, \`about\`, \`settings\``, false);

            //helpEmbed.addField('Links', `${emojis.get('bullet')} [Website](${client.config.website})\n${emojis.get('bullet')} [Play & Support Server](${client.config.supportServer})`, false);

            helpEmbed.setAuthor({ name: client.user.username, iconURL: client.user.displayAvatarURL() });
            helpEmbed.setThumbnail('https://i.ibb.co/KDGh8m6/6400115.png');

            const btnWebsite = client.extends.button({
                label: 'Website',
                style: 'LINK',
                //emoji: emojis.get('icon:github'),
                url: client.config.website
            });

            const btnSupport = client.extends.button({
                label: 'Play & Support Server',
                style: 'LINK',
                //emoji: emojis.get('icon:github'),
                url: client.config.supportServer
            });

            const btnAbout = client.extends.button({
                id: 'btn_about',
                label: 'About',
                style: 'PRIMARY'
            });

            const btnSettings = client.extends.button({
                id: 'btn_settings',
                label: 'Settings',
                style: 'PRIMARY'
            });

            const row = client.extends.row().addComponents(btnSettings).addComponents(btnAbout).addComponents(btnSupport).addComponents(btnWebsite);

            const helpMessage =await message.channel.send({ embeds: [helpEmbed], components: [row] });

            const collector = client.extends.collector(helpMessage, message.author);

            collector.on('collect', async (i) => {
                switch(i.customId) {
                    case "btn_about":
                        await client.container.commands.get('about').run(client, message, args, level);
                        break;
                    case "btn_settings":
                        await client.container.commands.get('settings').run(client, message, args, level);
                        break;
                }
            });
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

                helpEmbed.setAuthor({ name: client.user.username, iconURL: client.user.displayAvatarURL() });
                helpEmbed.setThumbnail('https://i.ibb.co/KDGh8m6/6400115.png');
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