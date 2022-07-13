const humanizeDuration = require('humanize-duration');

exports.run = async (client, message, args, level) => { // eslint-disable-line no-unused-vars
    const { customEmojis: emojis } = client;

    try {
        const userData = await client.requester.send({
            method: 'getUser',
            user: message.member.user
        });

        if (!userData.ship) {
            await client.container.commands.get('play').run(client, message, args, level);
            return;
        }

        const cooldowns = await client.requester.send({
            method: 'getCooldowns',
            user: message.member.user
        });

        const sectorEmbed = client.extends.embed();
        sectorEmbed.title = `Character Profile`;
        sectorEmbed.description = `> Quick overview of your character profile.

**Rank** \`${userData.rank}\`
**Credits** \`${userData.credits}\`
`;

        sectorEmbed.addField('Ship', `${emojis.get('bullet')} Name: \`${userData.ship.name}\`\n${emojis.get('bullet')} Class: \`${userData.ship.class}\`\n${emojis.get('bullet')} Level: \`${userData.ship.level}\``, true);
        sectorEmbed.addField('Cooldowns', `${emojis.get('bullet')} Mining: \`${cooldowns.miningRemaining ? humanizeDuration(cooldowns.miningRemaining, { maxDecimalPoints: 0 }) : 'Available'}\``, true);

        sectorEmbed.setAuthor({ name: message.author.username, iconURL: message.author.displayAvatarURL() });
        sectorEmbed.setThumbnail('https://i.ibb.co/KDGh8m6/6400115.png');

        const btnShip = client.extends.button({
            id: 'btn_ship',
            label: 'Ship',
            style: 'PRIMARY'
        });

        const row = client.extends.row().addComponents(btnShip);

        const userMsg = await message.channel.send({
            embeds: [sectorEmbed],
            components: [row]
        });

        const collector = client.extends.collector(userMsg, message.author);

        collector.on('collect', async (i) => {
            if (i.customId === "btn_ship") { // Turn to switch when more conditions are added
                await client.container.commands.get('ship').run(client, message, args, level);
            }
        });

    } catch (err) {
        const errorId = await client.errorHandler.send(
            "User command",
            err,
            message.guild.name,
            message,
            undefined
        );
        await message.channel.send({
            embeds: [client.extends.errorEmbed("user", errorId)],
        });
    }
};

exports.conf = {
    enabled: true,
    guildOnly: false,
    aliases: ['profile', 'character', 'char'],
    permLevel: "User",
    requiresAPIConnection: true
};

exports.help = {
    name: "user",
    category: "Game",
    description: "Information about your character.",
    usage: "user",
    rootCmd: false
};