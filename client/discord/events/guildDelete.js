module.exports = async (client, guild) => {
    if (!guild.available) return; // If there is an outage, return.

    client.logger.log(`[GUILD LEAVE] ${guild.id} removed the bot.`);

    // If the settings Enmap contains any guild overrides, remove them.
    // No use keeping stale data!
    if (client.settings.guild.has(guild.id))
        client.settings.guild.delete(guild.id);

    // TODO send to webhook
};