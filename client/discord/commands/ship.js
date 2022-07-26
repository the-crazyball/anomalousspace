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
        let count = 1;
        let shipNameOld = ship.name;

        ship.modules.forEach(m => {
            modules += `\`${m.name}\``;
            if (count < ship.modules.length) {
                modules += `, `;
            }
            count++;
        });

        const msgEmbed = client.extends.embed();
        msgEmbed.title = `Ship`;
        msgEmbed.description = `> Everything you need to know about your ship.`;

        msgEmbed.addField('Details', `${emojis.get('bullet')} Name: \`${ship.name}\`
${emojis.get('bullet')} Level: \`${ship.level}\`
${emojis.get('bullet')} Experience: \`${ship.xp}/200\`
${emojis.get('bullet')} HP: \`${ship.hp}/40\`
`, true);
        msgEmbed.addField('Extra', `${emojis.get('bullet')} Class: \`${ship.class}\`
${emojis.get('bullet')} Cargo Bays: \`${ship.cargoBay}\`
${emojis.get('bullet')} Size: \`${ship.size}\`
`, true);

        msgEmbed.addField(`Modules \`${ship.modules.length}/${ship.modulesMax}\``, modules, false);
        msgEmbed.addField('Sector', `${emojis.get('bullet')} Name: \`${ship.sector.name}\`\n${emojis.get('bullet')} Position: \`${ship.sector.x}\`,\`${ship.sector.y}\``, true);
        msgEmbed.addField('Galaxy', `${emojis.get('bullet')} Name: \`${ship.galaxy.name}\`\n${emojis.get('bullet')} Type: \`${userData.ship.galaxy.type}\`\n${emojis.get('bullet')} Position: \`${userData.ship.galaxy.x}\`,\`${userData.ship.galaxy.y}\``, true);

        msgEmbed.setAuthor({ name: message.author.username, iconURL: message.author.displayAvatarURL() });
        msgEmbed.setThumbnail('https://i.ibb.co/KDGh8m6/6400115.png');

        const btnCargo = client.extends.button({
            id: 'btn_cargo',
            label: 'Cargo',
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
        const row = client.extends.row()
            .addComponents(btnCargo)
            .addComponents(btnModules)
            .addComponents(btnRename);

        const shipMsg = await message.channel.send({
            embeds: [msgEmbed],
            components: [row]
        });

        const collector = client.extends.collector(shipMsg, message.author);

        collector.on('collect', async (i) => {
            switch(i.customId) {
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