exports.run = async (client, message, args, level) => { // eslint-disable-line no-unused-vars

    try {
        let userData = await client.requester.getUser(message.member.user);

        const ship = userData.ship;

        if (!userData.ship) {
            await client.container.commands.get('play').run(client, message, args, level);
            return;
        }

        let items = '';

        const msgEmbed = client.extends.embed();
        msgEmbed.title = `Ship Cargo Details`;
        msgEmbed.description = `> Your ship cargo.\n\n`;

        ship.cargo.forEach(item => {
            // TODO change cargo amount to quantity and add name
            items += `\`${item.quantity}\` x \`${item.name}\`\n`;
        });

        msgEmbed.description += items;

        msgEmbed.setAuthor({ name: message.author.username, iconURL: message.author.displayAvatarURL() });
        msgEmbed.setThumbnail('https://i.ibb.co/KDGh8m6/6400115.png');

        const cargoMsg = await message.channel.send({
            embeds: [msgEmbed],
            components: []
        });

        const collector = client.extends.collector(cargoMsg, message.author);

        collector.on('collect', async (_) => {
            // collector
        });

    } catch (err) {
        const errorId = await client.errorHandler.send(
            "Cargo command",
            err,
            message.guild.name,
            message,
            undefined
        );
        await message.channel.send({
            embeds: [client.extends.errorEmbed("cargo", errorId)],
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
    name: "cargo",
    category: "Game",
    description: "Ship cargo details and information.",
    usage: "cargo",
    rootCmd: false
};