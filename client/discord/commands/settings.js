exports.run = async (client, message, args, level) => { // eslint-disable-line no-unused-vars
    const settings = message.settings;
    //const { customEmojis: emojis } = client;

    try {
        // settings

        let components = [];

        const msgEmbed = client.extends.embed();
        msgEmbed.title = `Settings`;
        msgEmbed.description = `> View or change the bot settings to better suit your gameplay.

\`Prefix\` currently \`${settings.prefix}\`
> This is the bot prefix used to play. Also note, you can always type <@!${client.user.id}> to get your prefix.`;

        msgEmbed.setAuthor({ name: message.author.username, iconURL: message.author.displayAvatarURL() });
        msgEmbed.setThumbnail('https://i.ibb.co/KDGh8m6/6400115.png');

        const btnPrefix = client.extends.button({
            id: 'btn_prefix@noDefer',
            label: 'Set Prefix',
            style: 'PRIMARY'
        });

        const buttons = client.extends.row()
            .addComponents(btnPrefix);

        components.push(buttons);

        const settingsMessage = await message.channel.send({
            embeds: [msgEmbed],
            components: components
        });

        const collector = client.extends.collector(settingsMessage, message.author);

        collector.on('collect', async (i) => {
            switch(i.customId) {
                case "myModal":
                    console.log('test');
                    break;
                case btnPrefix.customId: {

                    // this is where the response will come from the modal submit
                    // called from the interactionCreate event, until there is a
                    // better of doing this, this is the best option
                    const modalSubmitCb = async (fields) => {
                        const prefixInput = fields.getTextInputValue('prefixInput');

                        if (/^\s/.test(prefixInput)) { // check for space
                            const prefixErrorEmbed = client.extends.embed({ color: 'error' });
                            prefixErrorEmbed.setDescription(`Error, you cannot have a prefix start with a space, please try again.`);

                            await settingsMessage.edit({
                                embeds: [prefixErrorEmbed],
                                components: []
                            });
                        } else {
                            const prefixSuccessEmbed = client.extends.embed({ color: 'success' });
                            prefixSuccessEmbed.setDescription(`Success! Your new prefix is now \`${prefixInput}\`.`);

                            await settingsMessage.edit({
                                embeds: [prefixSuccessEmbed],
                                components: []
                            });

                            client.settings.user.set(message.member.user.id, { prefix: prefixInput });
                        }
                    };
                    i.message.modalSubmitCb = modalSubmitCb;

                    const modal = client.extends.modal();
                    modal.setTitle('Set Prefix');
                    modal.setCustomId('modal_userPrefix');

                    const prefixInput = client.extends.textInput({
                        id: 'prefixInput',
                        label: 'Enter a new prefix',
                        required: true,
                        style: 'SHORT'
                    });

                    prefixInput.setMinLength(1);
                    prefixInput.setValue(settings.prefix);

                    const firstActionRow = client.extends.row().addComponents(prefixInput);

                    modal.addComponents(firstActionRow);

                    await i.showModal(modal);
                    break;
                }
            }
        });

    } catch (err) {
        const errorId = await client.errorHandler.send(
            "Settings command",
            err,
            message.guild.name,
            message,
            undefined
        );
        await message.channel.send({
            embeds: [client.extends.errorEmbed("settings", errorId)],
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
    name: "settings",
    category: "Game",
    description: "Player and server admin settings.",
    usage: "settings",
    rootCmd: false
};