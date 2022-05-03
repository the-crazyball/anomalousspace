module.exports = async (client, interaction) => {
    try {
        if (interaction.isButton()) await interaction.deferUpdate();
        if (interaction.isSelectMenu()) await interaction.deferUpdate();
    } catch (err) {
        await client.errorHandler.send("interaction create event", err);
    }
};