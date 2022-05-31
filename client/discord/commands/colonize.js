exports.run = async (client, message, args, level) => { // eslint-disable-line no-unused-vars
    const { customEmojis: emojis } = client;

    try {
        let userData = await client.requester.getUser(message.member.user);

        const astronomicalObjects = await client.requester.send({
            method: 'colonizeGetObjects',
            user: message.member.user
        });

        if (!userData.ship) {
            await client.container.commands.get('play').run(client, message, args, level);
            return;
        }

        const title = `Colonize`;
        if (!astronomicalObjects.length) {
            const sectorEmbed = client.extends.embed();
            sectorEmbed.title = title;
            sectorEmbed.description = `There is nothing here to colonize. Keep scanning sectors to find planets to colonize.`;

            await message.channel.send({
                embeds: [sectorEmbed],
                components: []
            });
            return;
        }

        let objects = [];
        let selectedObject = null;

        astronomicalObjects.forEach(o => {
            objects.push({
                label: `${o.name}`,
                description: `Population: ${o.population}`,
                value: `${o.name}`,
                emoji: emojis.get(o.type)
            });
        });

        const objectSelect = client.extends.select({
            id: 'select_object',
            placeHolder: 'Select an astronomical object...',
            options: objects
        });

        const row = client.extends.row().addComponents(objectSelect);

        const msgEmbed = client.extends.embed();
        msgEmbed.title = `Colonize`;
        msgEmbed.description = `> This system has \`${astronomicalObjects.length}\` astronomical object(s) that you can colonize.`;

        msgEmbed.setAuthor({ name: message.author.username, iconURL: message.author.displayAvatarURL() });
        msgEmbed.setThumbnail('https://i.ibb.co/KDGh8m6/6400115.png');
        msgEmbed.setFooter({ text: `${client.config.copyright}` });

        const colonizeMsg = await message.channel.send({
            embeds: [msgEmbed],
            components: [row]
        });

        const collector = client.extends.collector(colonizeMsg, message.author);

        collector.on('collect', async (i) => {
            if (i.customId === "btn_colonize") {
                const returnData = await client.requester.send({
                    method: 'colonize',
                    user: message.member.user,
                    data: {
                        selectedObject
                    }
                });

                if (returnData.colonized) {
                    const msgEmbed = client.extends.embed({ color: 'success' });
                    msgEmbed.description = `You successfully colonized \`${selectedObject}\`.`;

                    await colonizeMsg.edit({
                        embeds: [msgEmbed], components: []
                    });
                } else {
                    const msgEmbed = client.extends.embed({ color: 'error' });
                    msgEmbed.description = `It appears that \`${selectedObject}\` is already colonized.\n\nTry finding another planet that hasn't been colonized.`;

                    await colonizeMsg.edit({
                        embeds: [msgEmbed], components: []
                    });
                }
            }
            if (i.customId === "select_object") {
                objectSelect.options.forEach(r => {
                    if (r.value === i.values[0]) r.default = true;
                    else r.default = false;
                });

                selectedObject = i.values[0];

                const btnColonize = client.extends.button({
                    id: 'btn_colonize',
                    label: 'Colonize',
                    style: 'PRIMARY'
                });

                const row2 = client.extends.row().addComponents(btnColonize);

                await colonizeMsg.edit({
                    components: [row, row2]
                });
            }
        });

    } catch (err) {
        const errorId = await client.errorHandler.send(
            "Colonize command",
            err,
            message.guild.name,
            message,
            undefined
        );
        await message.channel.send({
            embeds: [client.extends.errorEmbed("colonize", errorId)],
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
    name: "colonize",
    category: "Game",
    description: "Colonize an planet but creating a colony.",
    usage: "colonize",
    rootCmd: false
};