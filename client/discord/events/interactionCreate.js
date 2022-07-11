module.exports = async (client, interaction) => {
    try {
        if (interaction.isButton()) {
            if (interaction.customId !== 'btn_prefix' && interaction.customId !== 'btn_rename') {
                await interaction.deferUpdate();
            }
        }
        if (interaction.isSelectMenu()) await interaction.deferUpdate();
        if (interaction.isModalSubmit()) {
            if (interaction.customId === 'modal_userPrefix') {
                interaction.message.modalSubmitCb(interaction.fields);
            }
            if (interaction.customId === 'modal_shipName') {
                interaction.message.modalSubmitCb(interaction.fields);
            }
            await interaction.deferUpdate();
        }
    } catch (err) {
        await client.errorHandler.send("interaction create event", err);
    }
};