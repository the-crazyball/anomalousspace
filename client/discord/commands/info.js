exports.run = async (client, message, args, level) => { // eslint-disable-line no-unused-vars
    const { customEmojis: emojis } = client;

    try {
        let userData = await client.requester.getUser(message.member.user);

        if (!userData.ship) {
            await client.container.commands.get('play').run(client, message, args, level);
            return;
        }

        const title = `Quick Information`;
        const sectorEmbed = client.extends.embed();
        sectorEmbed.title = title;
        sectorEmbed.description = `> Quick information about the galaxy and sector.`;

        sectorEmbed.addField('Galaxy', `${emojis.get('bullet')} Name: \`${userData.ship.galaxy.name}\`\n${emojis.get('bullet')} Sectors: \`${userData.ship.galaxy.sectors * 4}\`\n${emojis.get('bullet')} Type: \`${userData.ship.galaxy.type}\`\n${emojis.get('bullet')} Position: \`${userData.ship.galaxy.x}\`,\`${userData.ship.galaxy.y}\`,\`0\`\n${emojis.get('bullet')} Ships Visited: \`${userData.ship.galaxy.visitedBy.length}\``, true);
        sectorEmbed.addField('Sector', `${emojis.get('bullet')} Name: \`${userData.ship.sector.name}\`\n${emojis.get('bullet')} Position: \`${userData.ship.sector.x}\`,\`${userData.ship.sector.y}\`,\`0\`\n${emojis.get('bullet')} Ships Visited: \`${userData.ship.sector.visitedBy.length}\`\n${emojis.get('bullet')} Ships Scanned: \`${userData.ship.sector.scannedBy.length}\``, true);

        await message.channel.send({
            embeds: [sectorEmbed],
            components: []
        });

    } catch (err) {
        const errorId = await client.errorHandler.send(
            "Info command",
            err,
            message.guild.name,
            message,
            undefined
        );
        await message.channel.send({
            embeds: [client.extends.errorEmbed("info", errorId)],
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
    name: "info",
    category: "Game",
    description: "Information on something specific.",
    usage: "info",
    rootCmd: false
};