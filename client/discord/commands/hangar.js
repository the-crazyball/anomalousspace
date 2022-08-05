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

        const modulesFiltered = ship.hangar.filter(m => m.type !== 'engine');

        modulesFiltered.forEach(m => {
            modules += `${emojis.get(m.icon)} \`${m.name}\` <:tier:1004106548777320469> \`${m.tier}/${m.tierMax}\` <:power_prod:1004109268208861334> \`${m.powerProduction}\` <:power_consumption:1004112112190242866> \`${m.powerConsumption}\`\n`;
            equippedModules.push({
                label: `${m.name}`,
                value: `${m.id}`,
                emoji: emojis.get(m.icon)
            });
        });

        if (!modulesFiltered.length) {
            modules = '*Your hangar bay is empty.*';
        }

        const msgEmbed = client.extends.embed();
        msgEmbed.title = `Hangar Bay`;
        msgEmbed.description = `> The hangar bay for all unused/unequipped modules.\n\nHangar bay capacity \`${ship.hangarMax}\`. `;

        msgEmbed.addField(`Module(s) \`${modulesFiltered.length}/${ship.hangarMax}\``, modules, false);

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

                    selectedModule = ship.hangar.find(m => m.id == i.values[0]);

                    const btnUpgrade = client.extends.button({
                        id: 'btn_upgrade',
                        label: 'Upgrade',
                        style: 'PRIMARY'
                    });

                    const btnEquip = client.extends.button({
                        id: 'btn_equip',
                        label: 'Equip',
                        style: 'PRIMARY'
                    });

                    components[1].addComponents(btnUpgrade).addComponents(btnEquip);

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
                            equipped: false
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

                        await client.container.commands.get('hangar').run(client, message, args, level);
                    }
                    break;
                }
                case "btn_equip": {

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

                    await client.container.commands.get('hangar').run(client, message, args, level);

                    break;
                }
            }
        });

    } catch (err) {
        const errorId = await client.errorHandler.send(
            "Hangar command",
            err,
            message.guild.name,
            message,
            undefined
        );
        await message.channel.send({
            embeds: [client.extends.errorEmbed("hangar", errorId)],
        });
    }
};

exports.conf = {
    enabled: true,
    guildOnly: false,
    aliases: ['hangarbay','hb'],
    permLevel: "User",
    requiresAPIConnection: true
};

exports.help = {
    name: "hangar",
    category: "Game",
    description: "The hangar bay is where all you unquipped modules reside.",
    usage: "hangar",
    rootCmd: false
};