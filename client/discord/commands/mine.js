const humanizeDuration = require('humanize-duration');

exports.run = async (client, message, args, level) => { // eslint-disable-line no-unused-vars
    const settings = message.settings;
    const { customEmojis: emojis } = client;

    try {
        let userData = await client.requester.getUser(message.member.user);

        if (!userData.ship) {
            await client.container.commands.get('play').run(client, message, args, level);
            return
        }

        let miningData = await client.requester.mine(message.member.user);

        const title = `Mining Results`;

        const resultEmbed = client.extends.embed();
        resultEmbed.title = title;

        if (miningData.inCooldown) {
            resultEmbed.description = `You are unable to mine at this time, please try again when the cooldown has completed.\n\n**Available in** \`${humanizeDuration(miningData.cdRemaining, { maxDecimalPoints: 0 })}\``
        } else if (miningData.hasAsteroids) {
            resultEmbed.description = `Congrats, you mined \`${client.helpers.numberWithCommas(miningData.amountMined)}\` the sector has \`${client.helpers.numberWithCommas(miningData.asteroidsTotal)}\` asteroids left.`;
        } else {
            resultEmbed.description = `The sector has \`0\` asteroids left to mine.`;
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