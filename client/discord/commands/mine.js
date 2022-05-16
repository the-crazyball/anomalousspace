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
        resultEmbed.description = `mining result details here.... currently ${miningData.mined}`;

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