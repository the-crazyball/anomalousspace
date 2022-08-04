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
        //const power = ship.modules.find(m => m.type === 'generator');
        const cargo = ship.modules.find(m => m.type === 'cargo');

        const modulesFiltered = ship.modules.filter(m => m.type !== 'engine');

        modulesFiltered.forEach(m => {
            if (m.type !== 'engine') {
                modules += `${emojis.get(m.icon)} \`${m.name}\` <:tier:1004106548777320469> \`${m.tier}/${m.tierMax}\` <:power_prod:1004109268208861334> \`${m.powerProduction}\` <:power_consumption:1004112112190242866> \`${m.powerConsumption}\`\n`;
            }
        });

        if (!modulesFiltered.length) {
            modules = '*You have no modules equipped at this time.*';
        }

        const msgEmbed = client.extends.embed();
        msgEmbed.title = `Ship`;
        msgEmbed.description = `> Everything you need to know about your ship.`;

        msgEmbed.addField('Details', `${emojis.get('bullet')} Name: \`${ship.name}\`
${emojis.get('bullet')} Tier: \`${ship.tier}/${ship.tierMax}\`
${emojis.get('bullet')} Class: \`${ship.class}\`
${emojis.get('bullet')} Size: \`${ship.size}\`
`, true);
        msgEmbed.addField('Stats', `${emojis.get('bullet')} Attack: \`${ship.stats.AP}\`
${emojis.get('bullet')} Defense: \`${ship.stats.DP}\`
${emojis.get('bullet')} HP: \`${ship.stats.hp}/${ship.stats.hpMax}\`
`, true);

        //msgEmbed.addField(`Power`, `${emojis.get(power.icon)} \`${power.name}\` <:tier:1004106548777320469> \`${power.tier}/${power.tierMax}\` <:power_prod:1004109268208861334> \`${power.powerProduction}\``, false);
        msgEmbed.addField(`Engine`, `${emojis.get(engine.icon)} \`${engine.name}\` <:tier:1004106548777320469> \`${engine.tier}/${engine.tierMax}\` <:power_prod:1004109268208861334> \`${engine.powerProduction}\` <:power_consumption:1004112112190242866> \`${engine.powerConsumption}\``, false);
        msgEmbed.addField(`Equipped Modules`, modules, false);
        msgEmbed.addField('Sector', `${emojis.get('bullet')} Name: \`${ship.sector.name}\`\n${emojis.get('bullet')} Position: \`${ship.sector.x}\`,\`${ship.sector.y}\``, true);
        msgEmbed.addField('Galaxy', `${emojis.get('bullet')} Name: \`${ship.galaxy.name}\`\n${emojis.get('bullet')} Type: \`${userData.ship.galaxy.type}\`\n${emojis.get('bullet')} Position: \`${userData.ship.galaxy.x}\`,\`${userData.ship.galaxy.y}\``, true);

        msgEmbed.setAuthor({ name: message.author.username, iconURL: message.author.displayAvatarURL() });
        msgEmbed.setThumbnail('https://i.ibb.co/KDGh8m6/6400115.png');

        const btnCargo = client.extends.button({
            id: 'btn_cargo',
            label: 'Cargo Hold',
            style: 'PRIMARY'
        });

        const btnHangar = client.extends.button({
            id: 'btn_hangar',
            label: 'Hangar Bay',
            style: 'PRIMARY'
        });

        const btnModules = client.extends.button({
            id: 'btn_modules',
            label: 'Modules',
            style: 'PRIMARY'
        });

        const btnRename = client.extends.button({
            id: 'btn_rename@noDefer',
            label: 'Rename',
            style: 'PRIMARY'
        });

        const row = client.extends.row();

        if (cargo) {
            row.addComponents(btnCargo);
        }

        row.addComponents(btnModules);
        row.addComponents(btnHangar);
        row.addComponents(btnRename);

        const shipMsg = await message.channel.send({
            embeds: [msgEmbed],
            components: [row]
        });

        const collector = client.extends.collector(shipMsg, message.author);

        collector.on('collect', async (i) => {
            switch(i.customId) {
                case "btn_hangar":
                    await client.container.commands.get('hangar').run(client, message, args, level);
                    break;
                case "btn_modules":
                    await client.container.commands.get('modules').run(client, message, args, level);
                    break;
                case "btn_cargo":
                    await client.container.commands.get('cargo').run(client, message, args, level);
                    break;
                case btnRename.customId: {
                    const modalSubmitCb = async (fields) => {
                        const shipName = fields.getTextInputValue('ShipNameInput');

                        if (/^\s/.test(shipName)) { // check for space at start
                            const nameErrorEmbed = client.extends.embed({ color: 'error' });
                            nameErrorEmbed.setDescription(`Error, you cannot have your ship's name start with a space, please try again.`);

                            await shipMsg.edit({
                                embeds: [nameErrorEmbed],
                                components: []
                            });
                        } else {
                            const renameSuccessEmbed = client.extends.embed({ color: 'success' });
                            renameSuccessEmbed.setDescription(`Success! Your ship is now named \`${shipName}\`.`);
                            await shipMsg.edit({
                                embeds: [renameSuccessEmbed],
                                components: []
                            });

                            await client.requester.send({
                                method: 'setShipName',
                                user: message.member.user,
                                data: {
                                    shipName
                                }
                            });
                            await new Promise(resolve => setTimeout(resolve, 2000));

                            msgEmbed.fields[0].value = msgEmbed.fields[0].value.replace(shipNameOld, shipName);
                            ship.name = shipName;
                            shipNameOld = shipName;

                            await shipMsg.edit({
                                embeds: [msgEmbed],
                                components: [row]
                            });
                        }
                    };
                    i.message.modalSubmitCb = modalSubmitCb;
                    const modal = client.extends.modal();
                    modal.setTitle('Rename ship');
                    modal.setCustomId('modal_shipName');
                    const nameInput = client.extends.textInput({
                        id: 'ShipNameInput',
                        label: 'Enter a new name for your ship',
                        required: true,
                        style: 'SHORT'
                    });
                    nameInput.setMinLength(1);
                    nameInput.setMaxLength(128);
                    nameInput.setValue(ship.name);
                    const firstActionRow = client.extends.row().addComponents(nameInput);
                    modal.addComponents(firstActionRow);
                    await i.showModal(modal);
                    break;
                }
            }
        });

    } catch (err) {
        const errorId = await client.errorHandler.send(
            "Ship command",
            err,
            message.guild.name,
            message,
            undefined
        );
        await message.channel.send({
            embeds: [client.extends.errorEmbed("ship", errorId)],
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
    name: "ship",
    category: "Game",
    description: "Ship details and information.",
    usage: "ship",
    rootCmd: false
};