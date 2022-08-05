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
        let selectedModule = null;
        let modulesSelect = null;
        let components = [];

        const modulesFiltered = ship.modules.filter(m => m.type !== 'engine');

        modulesFiltered.forEach(m => {
            modules += `${emojis.get(m.icon)} \`${m.name}\` <:tier:1004106548777320469> \`${m.tier}/${m.tierMax}\` <:power_prod:1004109268208861334> \`${m.powerProduction}\` <:power_consumption:1004112112190242866> \`${m.powerConsumption}\`\n`;
            equippedModules.push({
                label: `${m.name}`,
                value: `${m.id}`,
                emoji: emojis.get(m.icon)
            });
        });

        if (!modulesFiltered.length) {
            modules = '*You have no modules equipped at this time.*';
        }

        const msgEmbed = client.extends.embed();
        msgEmbed.title = `Ship Modules`;
        msgEmbed.description = `> A list of equipped modules on your ship.\n\nYour ship currently has a capacity of having \`${ship.modulesMax}\` modules equipped at a time. `;

        msgEmbed.addField(`Equipped \`${modulesFiltered.length}/${ship.modulesMax}\``, modules, false);

        msgEmbed.setAuthor({ name: message.author.username, iconURL: message.author.displayAvatarURL() });
        msgEmbed.setThumbnail('https://i.ibb.co/KDGh8m6/6400115.png');

        const btnShip = client.extends.button({
            id: 'btn_ship',
            label: '<',
            style: 'PRIMARY'
        });

        if (modulesFiltered.length) {
            modulesSelect = client.extends.select({
                id: 'select_module',
                placeHolder: 'Select a module...',
                options: equippedModules
            });

            const rowUnequip = client.extends.row().addComponents(modulesSelect);

            components.push(rowUnequip);
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
                case "select_module": {
                    modulesSelect.options.forEach(r => {
                        if (r.value === i.values[0]) r.default = true;
                        else r.default = false;
                    });

                    selectedModule = ship.modules.find(m => m.id == i.values[0]);

                    const btnUpgrade = client.extends.button({
                        id: 'btn_upgrade',
                        label: 'Upgrade',
                        style: 'PRIMARY'
                    });

                    const btnUnequip = client.extends.button({
                        id: 'btn_unequip',
                        label: 'Unequip',
                        style: 'PRIMARY'
                    });

                    components[1].addComponents(btnUpgrade).addComponents(btnUnequip);

                    await moduleMsg.edit({
                        components: components
                    });

                    break;
                }
                case "btn_upgrade": {
                    const returnData = await client.requester.send({
                        method: 'upgradeModule',
                        user: message.member.user,
                        data: {
                            id: selectedModule.id,
                            equipped: true
                        }
                    });

                    if (!returnData.success) {
                        const msgEmbed = client.extends.embed({ color: 'error' });
                        msgEmbed.description = returnData.message;

                        await moduleMsg.edit({
                            embeds: [msgEmbed], components: []
                        });
                    } else {

                        const successEmbed = client.extends.embed({ color: 'success' });
                        successEmbed.description = returnData.message;

                        await moduleMsg.edit({
                            embeds: [successEmbed],
                            components: []
                        });

                        await new Promise(resolve => setTimeout(resolve, 2000));

                        await client.container.commands.get('modules').run(client, message, args, level);
                    }

                    break;
                }
                case "btn_unequip": {
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