exports.run = async (client, message, args, level) => { // eslint-disable-line no-unused-vars
    const { customEmojis: emojis } = client;

    try {
        let userData = await client.requester.getUser(message.member.user);

        const ship = userData.ship;

        if (!userData.ship) {
            await client.container.commands.get('play').run(client, message, args, level);
            return;
        }

        const msgEmbed = client.extends.embed();
        msgEmbed.title = `Ship Details`;
        msgEmbed.description = `> Everything you need to know about your ship.

**»** Name: \`${ship.name}\`
**»** Class: \`${ship.class}\`
**»** Level: \`${ship.level}\`
`;

        msgEmbed.addField('Sector', `**»** Name: \`${ship.sector.name}\`\n**»** Position: \`${ship.sector.x}\`,\`${ship.sector.y}\`,\`${ship.sector.z}\``, true);
        msgEmbed.addField('Galaxy', `**»** Name: \`${ship.galaxy.name}\`\n**»** Type: \`${userData.ship.galaxy.type}\`\n**»** Position: \`${userData.ship.galaxy.x}\`,\`${userData.ship.galaxy.y}\`,\`${userData.ship.galaxy.z}\``, true);

        msgEmbed.addField('Jump Drive', `**»** Level: \`${ship.jumpDrive.level}\`/\`${ship.jumpDrive.levelMax}\` ${emojis.get('bar:on')}${emojis.get('bar:disabled')}${emojis.get('bar:disabled')}${emojis.get('bar:disabled')}${emojis.get('bar:disabled')}${emojis.get('bar:disabled')}${emojis.get('bar:disabled')}${emojis.get('bar:disabled')}`, false);
        msgEmbed.addField('Warp Drive', `**»** Level: \`${ship.warpDrive.level}\`/\`${ship.warpDrive.levelMax}\` ${emojis.get('bar:on')}${emojis.get('bar:off')}${emojis.get('bar:off')}${emojis.get('bar:disabled')}${emojis.get('bar:disabled')}${emojis.get('bar:disabled')}${emojis.get('bar:disabled')}${emojis.get('bar:disabled')}
**»** Fuel: \`${ship.warpDrive.fuel}\`/\`${ship.warpDrive.fuelMax}\``, false);
        msgEmbed.addField('Mining Lasers', `**»** Level: \`${ship.miningLaser.level}\`/\`${ship.miningLaser.levelMax}\` ${emojis.get('bar:on')}${emojis.get('bar:disabled')}${emojis.get('bar:disabled')}${emojis.get('bar:disabled')}${emojis.get('bar:disabled')}${emojis.get('bar:disabled')}${emojis.get('bar:disabled')}${emojis.get('bar:disabled')}`, false);

        msgEmbed.setAuthor({ name: message.author.username, iconURL: message.author.displayAvatarURL() });
        msgEmbed.setThumbnail('https://i.ibb.co/KDGh8m6/6400115.png');
        msgEmbed.setFooter({ text: `${client.config.copyright}` });

        const btnCargo = client.extends.button({
            id: 'btn_cargo',
            label: 'Cargo',
            style: 'PRIMARY'
        });

        const row = client.extends.row().addComponents(btnCargo);

        const shipMsg = await message.channel.send({
            embeds: [msgEmbed],
            components: [row]
        });

        const collector = client.extends.collector(shipMsg, message.author);

        collector.on('collect', async (i) => {
            if (i.customId === "btn_cargo") {
                await client.container.commands.get('cargo').run(client, message, args, level);
            }
        });

    } catch (err) {
        const errorId = await client.errorHandler.send(
            "Ship command",
            err,
            message.guild.name,
            message,
            undefined
        );
        await message.channel.send({
            embeds: [client.extends.errorEmbed("ship", errorId)],
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
    name: "ship",
    category: "Game",
    description: "Ship details and information.",
    usage: "ship",
    rootCmd: false
};