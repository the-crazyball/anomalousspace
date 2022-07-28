exports.run = async (client, message, args, level) => { // eslint-disable-line no-unused-vars
    const { customEmojis: emojis } = client;

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

        let modules = '';
        let shipNameOld = ship.name;

        const engine = ship.modules.find(m => m.type === 'engine');
        const power = ship.modules.find(m => m.type === 'generator');

        const modulesFiltered = ship.modules.filter(m => m.type !== 'engine');

        modulesFiltered.forEach(m => {
            if (m.type !== 'engine' && m.type !== 'generator') {
                modules += `${emojis.get('bullet')} Name: \`${m.name}\` ${emojis.get('bullet')} Tier: \`${m.tier}/${m.tierMax}\` ${emojis.get('bullet')} PC: \`-${m.powerConsumption}\`\n`;
            }
        });

        const msgEmbed = client.extends.embed();
        msgEmbed.title = `Ship Modules`;
        msgEmbed.description = `> It's all about ship modules.`;

        msgEmbed.setAuthor({ name: message.author.username, iconURL: message.author.displayAvatarURL() });
        msgEmbed.setThumbnail('https://i.ibb.co/KDGh8m6/6400115.png');

        const btnShip = client.extends.button({
            id: 'btn_ship',
            label: 'Ship',
            style: 'PRIMARY'
        });

        const row = client.extends.row()
            .addComponents(btnShip);

        const shipMsg = await message.channel.send({
            embeds: [msgEmbed],
            components: [row]
        });

        const collector = client.extends.collector(shipMsg, message.author);

        collector.on('collect', async (i) => {
            switch(i.customId) {
                case "btn_ship":
                    await client.container.commands.get('ship').run(client, message, args, level);
                    break;
            }
        });

    } catch (err) {
        const errorId = await client.errorHandler.send(
            "Modules command",
            err,
            message.guild.name,
            message,
            undefined
        );
        await message.channel.send({
            embeds: [client.extends.errorEmbed("modules", errorId)],
        });
    }
};

exports.conf = {
    enabled: true,
    guildOnly: false,
    aliases: ['mods'],
    permLevel: "User",
    requiresAPIConnection: true
};

exports.help = {
    name: "modules",
    category: "Game",
    description: "A listing of all ship modules to upgrade or change on your ship.",
    usage: "modules",
    rootCmd: false
};