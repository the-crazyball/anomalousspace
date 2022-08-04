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
        let equippedModules = [];
        let hangarBay = [];
        let selectedModule = null;
        let modulesUnequipSelect = null;
        let equipSelect = null;
        let components = [];

        const modulesFiltered = ship.modules.filter(m => m.type !== 'engine');

        modulesFiltered.forEach(m => {
            //if (m.type !== 'engine' && m.type !== 'generator') {
            modules += `${emojis.get(m.icon)} \`${m.name}\` <:tier:1004106548777320469> \`${m.tier}/${m.tierMax}\` <:power_prod:1004109268208861334> \`${m.powerProduction}\` <:power_consumption:1004112112190242866> \`${m.powerConsumption}\`\n`;
            //}
            equippedModules.push({
                label: `${m.name}`,
                value: `${m.id}`,
                emoji: emojis.get(m.icon)
            });
        });

        if (!modulesFiltered.length) {
            modules = '*You have no modules equipped at this time.*';
        }

        ship.hangar.forEach(m => {
            hangarBay.push({
                label: `${m.name}`,
                value: `${m.id}`,
                emoji: emojis.get(m.icon)
            });
        });

        const msgEmbed = client.extends.embed();
        msgEmbed.title = `Ship Modules`;
        msgEmbed.description = `> Equip or Unequip modules to enhance/expand your ship.\n\nYour ship currently has a capacity of having \`${ship.modulesMax}\` modules equipped at a time. `;

        msgEmbed.addField(`Equipped \`${modulesFiltered.length}/${ship.modulesMax}\``, modules, false);

        msgEmbed.setAuthor({ name: message.author.username, iconURL: message.author.displayAvatarURL() });
        msgEmbed.setThumbnail('https://i.ibb.co/KDGh8m6/6400115.png');

        const btnShip = client.extends.button({
            id: 'btn_ship',
            label: '<',
            style: 'PRIMARY'
        });

        if (modulesFiltered.length) {
            modulesUnequipSelect = client.extends.select({
                id: 'select_unquip',
                placeHolder: 'Unequip...',
                options: equippedModules
            });

            const rowUnequip = client.extends.row().addComponents(modulesUnequipSelect);

            components.push(rowUnequip);
        }

        if (ship.hangar.length) {
            equipSelect = client.extends.select({
                id: 'select_equip',
                placeHolder: 'Equip from hangar...',
                options: hangarBay
            });

            const rowEquip = client.extends.row().addComponents(equipSelect);

            components.push(rowEquip);
        }

        const row = client.extends.row()
            .addComponents(btnShip);

        components.push(row);

        const moduleMsg = await message.channel.send({
            embeds: [msgEmbed],
            components: components
        });

        const collector = client.extends.collector(moduleMsg, message.author);

        collector.on('collect', async (i) => {
            switch(i.customId) {
                case "btn_ship":
                    await client.container.commands.get('ship').run(client, message, args, level);
                    break;
                case "select_unquip": {
                    modulesUnequipSelect.options.forEach(r => {
                        if (r.value === i.values[0]) r.default = true;
                        else r.default = false;
                    });

                    selectedModule = ship.modules.find(m => m.id == i.values[0]);

                    const successEmbed = client.extends.embed({ color: 'success' });
                    successEmbed.setDescription(`Success! You have unequipped \`${selectedModule.name}\`.`);
                    await moduleMsg.edit({
                        embeds: [successEmbed],
                        components: []
                    });

                    await client.requester.send({
                        method: 'unequipModule',
                        user: message.member.user,
                        data: {
                            id: selectedModule.id
                        }
                    });

                    await new Promise(resolve => setTimeout(resolve, 2000));

                    await client.container.commands.get('modules').run(client, message, args, level);

                    break;
                }
                case "select_equip": {
                    equipSelect.options.forEach(r => {
                        if (r.value === i.values[0]) r.default = true;
                        else r.default = false;
                    });

                    selectedModule = ship.hangar.find(m => m.id == i.values[0]);

                    const successEmbed = client.extends.embed({ color: 'success' });
                    successEmbed.setDescription(`Success! You have equipped \`${selectedModule.name}\`.`);
                    await moduleMsg.edit({
                        embeds: [successEmbed],
                        components: []
                    });

                    await client.requester.send({
                        method: 'equipModule',
                        user: message.member.user,
                        data: {
                            id: selectedModule.id
                        }
                    });

                    await new Promise(resolve => setTimeout(resolve, 2000));

                    await client.container.commands.get('modules').run(client, message, args, level);

                    break;
                }
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