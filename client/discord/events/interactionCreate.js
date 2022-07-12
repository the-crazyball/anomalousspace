module.exports = async (client, interaction) => {
    try {
        if (interaction.isButton()) {
            if (!interaction.customId.includes("@noDefer")) {
                await interaction.deferUpdate();
            }
        }
        if (interaction.isSelectMenu()) await interaction.deferUpdate();
        if (interaction.isModalSubmit()) {
            if (interaction.message.hasOwnProperty("modalSubmitCb")) {
                interaction.message.modalSubmitCb(interaction.fields);
            }
            await interaction.deferUpdate();
        }
    } catch (err) {
        await client.errorHandler.send("interaction create event", err);
    }
};