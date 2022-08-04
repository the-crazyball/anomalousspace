const humanizeDuration = require('humanize-duration');

exports.run = async (client, message, args, level) => { // eslint-disable-line no-unused-vars
    try {
        const userData = await client.requester.send({
            method: 'getUser',
            user: message.member.user
        });

        if (!userData.ship) {
            await client.container.commands.get('play').run(client, message, args, level);
            return;
        }
        let playerSector = userData.ship.sector;

        const miningResult = await client.requester.send({
            method: 'mine',
            user: message.member.user
        });

        const title = `Mining Results`;

        const resultEmbed = client.extends.embed();
        resultEmbed.title = title;
        if (miningResult.success) {
            if (miningResult.hasAsteroids) {
                // TODO maybe a better way of doing this? Since the server doesn't talk to discord directly
                // TODO need to store this here on the client site to process for notifications.
                client.settings.notifier.set(message.member.user.id, { cooldowns: { mining: miningResult.cooldownTime } });
                resultEmbed.description = `Congratulations, you mined \`${client.helpers.numberWithCommas(miningResult.amountMined)}\` asteroids.\n\nSector \`${playerSector.name}\` has \`${client.helpers.numberWithCommas(miningResult.asteroidsTotal)}\` asteroids left.`;
            } else {
                resultEmbed.description = `Sector \`${playerSector.name}\` has \`0\` asteroids left to mine.`;
            }
        } else {
            if (miningResult.inCooldown) {
                resultEmbed.description = `You are unable to mine at this time, please try again when the cooldown has completed.\n\n**Available in** \`${humanizeDuration(miningResult.cdRemaining, { maxDecimalPoints: 0 })}\``;
            } else {
                resultEmbed.description = miningResult.message;
            }
        }

        await message.channel.send({
            embeds: [resultEmbed],
            components: []
        });

    } catch (err) {
        const errorId = await client.errorHandler.send(
            "Mine command",
            err,
            message.guild.name,
            message,
            undefined
        );
        await message.channel.send({
            embeds: [client.extends.errorEmbed("mine", errorId)],
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
    name: "mine",
    category: "Game",
    description: "Mining for resources.",
    usage: "scan",
    rootCmd: false
};