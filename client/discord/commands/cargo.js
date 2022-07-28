exports.run = async (client, message, args, level) => { // eslint-disable-line no-unused-vars

    try {
        const userData = await client.requester.send({
            method: 'getUser',
            user: message.member.user
        });

        const ship = userData.ship;

        if (!userData.ship) {
            await client.container.commands.get('play').run(client, message, args, level);
            return;
        }

        // check if we have the cargo hold module equiped
        const cargoHold = ship.modules.find(m => m.type === 'cargo');
        if (!cargoHold) {
            const noCargoEmbed = client.extends.embed({ color: 'error' });
            noCargoEmbed.title = `Oops....`;
            noCargoEmbed.description = `It would appear that your ship has no \`cargo hold\` equipped\n\nTry again when you have a \`cargo hold module\` equipped.`;

            await message.channel.send({
                embeds: [noCargoEmbed],
                components: []
            });
            return;
        }

        let items = '';
        let cargoHoldQtyCurrent = 0;

        cargoHold.cargo.forEach(c => {
            if (c.quantity) {
                cargoHoldQtyCurrent += c.quantity;
            }
        });

        const cargoSpace = cargoHold.cargoMax - cargoHoldQtyCurrent;

        const msgEmbed = client.extends.embed();
        msgEmbed.title = `Cargo Hold Details`;
        msgEmbed.description = `> Your ship cargo hold has \`${cargoSpace}\` available space.\n\n`;

        cargoHold.cargo.forEach(item => {
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

        collector.on('collect', async () => {
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