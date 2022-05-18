const { MessageActionRow, TextInputComponent } = require('discord.js');

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
        msgEmbed.setFooter({ text: `${client.config.copyright}` });

        const btnPrefix = client.extends.button({
            id: 'btn_prefix',
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
            if (i.customId === "myModal") {
                console.log('test');
            }
            if (i.customId === "btn_prefix") {

                // this is where the response will come from the modal submit
                // called from the interactionCreate event, until there is a
                // better of doing this, this is the best option
                const modalSubmitCb = async (fields) => {
                    const prefixInput = fields.getTextInputValue('prefixInput');

                    const prefixSuccessEmbed = client.extends.embed({ color: 'success' });
                    prefixSuccessEmbed.setDescription(`Success! Your new prefix is now \`${prefixInput}\`.`);

                    await settingsMessage.edit({
                        embeds: [prefixSuccessEmbed],
                        components: []
                    });

                    client.settings.user.set(message.member.user.id, { prefix: prefixInput });

                    console.log({ prefixInput });
                };
                i.message.modalSubmitCb = modalSubmitCb;

                const modal = client.extends.modal();
                modal.setTitle('Set Prefix');
                modal.setCustomId('modal_userPrefix');

                const favoriteColorInput = new TextInputComponent()
                    .setCustomId('prefixInput')
                    .setLabel("Enter a new prefix")
                    .setMinLength(1)
                    .setRequired(true)
                    .setValue(settings.prefix)
                    .setStyle('SHORT'); //IMPORTANT: Text Input Component Style can be 'SHORT' or 'LONG'

                const firstActionRow = new MessageActionRow().addComponents(favoriteColorInput);

                modal.addComponents(firstActionRow);

                await i.showModal(modal);

                /*const prefixEmbed = client.extends.embed();
                prefixEmbed.setDescription(`Enter a desired prefix.\n\n*Please type in your answer.*`);

                await message.channel.send({
                    embeds: [prefixEmbed]
                });

                const msgCollector = client.extends.messageCollector(i, 1);

                msgCollector.on("end", async (collected, reason) => {
                    if (reason === 'limit') {
                          const prefixSuccessEmbed = client.extends.embed({ color: 'success' });
                          prefixSuccessEmbed.setDescription(`Success! Your new prefix is now \`${collected.first().content}\`.`);

                          await message.channel.send({
                              embeds: [prefixSuccessEmbed]
                          });

                          client.settings.user.set(message.member.user.id, { prefix: collected.first().content });
                    }
                    if (reason === 'time') {
                        const prefixFailureEmbed = client.extends.embed({ color: 'error' });
                        prefixFailureEmbed.setDescription(`Failure! No answer was received. Please try again.`);

                        await message.channel.send({
                            embeds: [prefixFailureEmbed]
                        });
                    }
                });*/
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