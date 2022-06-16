exports.run = async (client, message, args, level) => { // eslint-disable-line no-unused-vars
    const { customEmojis: emojis } = client;

    try {
        let userData = await client.requester.getUser(message.member.user);

        if (!userData.ship) {
            await client.container.commands.get('play').run(client, message, args, level);
            return;
        }

        const colonies = await client.requester.send({
            method: 'getColonies',
            user: message.member.user
        });

        const title = `Colonies`;
        if (!colonies.length) {
            const sectorEmbed = client.extends.embed();
            sectorEmbed.title = title;
            sectorEmbed.description = `You don't have any colonies at this time.`;

            await message.channel.send({
                embeds: [sectorEmbed],
                components: []
            });
            return;
        }

        const msgEmbed = client.extends.embed();
        msgEmbed.title = title;
        msgEmbed.description = `> You currently have \`${colonies.length}\` colonies.\n\n`;

        colonies.forEach(c => {
            //aboutEmbed.addField('Contributors', `\`Surfside\`, \`Vraboros\`, \`Elemperor\``, true);
            msgEmbed.description += `${emojis.get(c.type)} **${c.name}**
**»** Galaxy: \`${c.sector.galaxy.name}\` (\`${c.sector.galaxy.x}\`,\`${c.sector.galaxy.y}\`,\`${c.sector.galaxy.z}\`)
**»** Sector: \`${c.sector.name}\` (\`${c.sector.x}\`,\`${c.sector.y}\`,\`${c.sector.z}\`)\n\n`;
        });

        msgEmbed.setAuthor({ name: message.author.username, iconURL: message.author.displayAvatarURL() });
        msgEmbed.setThumbnail('https://i.ibb.co/KDGh8m6/6400115.png');

        await message.channel.send({
            embeds: [msgEmbed],
            components: []
        });

    } catch (err) {
        const errorId = await client.errorHandler.send(
            "Colonies command",
            err,
            message.guild.name,
            message,
            undefined
        );
        await message.channel.send({
            embeds: [client.extends.errorEmbed("colonies", errorId)],
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
    name: "colonies",
    category: "Game",
    description: "View a list of all your colonies.",
    usage: "colonies",
    rootCmd: false
};