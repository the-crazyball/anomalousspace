module.exports = async (client, interaction) => {
    if (interaction.isButton()) await interaction.deferUpdate();
    if (interaction.isSelectMenu()) await interaction.deferUpdate();
};