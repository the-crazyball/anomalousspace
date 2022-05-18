exports.run = async (client, message, args, level) => { // eslint-disable-line no-unused-vars
    try {
        // coordinates

        let userData = await client.requester.getUser(message.member.user);

        if (!userData.ship) {
            await client.container.commands.get('play').run(client, message, args, level);
            return;
        }

        const coordEmbed = client.extends.embed();
        coordEmbed.description = `**Current Position** \`${userData.ship.position.x}\`,\`${userData.ship.position.y}\`,\`${userData.ship.position.z}\``;

        await message.channel.send({ embeds: [coordEmbed] });
    } catch (err) {
        const errorId = await client.errorHandler.send(
            "Coordinates command",
            err,
            message.guild.name,
            message,
            undefined
        );
        await message.channel.send({
            embeds: [client.extends.errorEmbed("coordinates", errorId)],
        });
    }
};

exports.conf = {
    enabled: true,
    guildOnly: false,
    aliases: ['coord', 'pos', 'position'],
    permLevel: "User",
    requiresAPIConnection: true
};

exports.help = {
    name: "coordinates",
    category: "Game",
    description: "Shows current location/sector coordinates.",
    usage: "coordinates",
    rootCmd: false
};