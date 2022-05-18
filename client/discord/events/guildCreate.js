module.exports = async (client, guild) => {
    client.logger.log(`[GUILD JOIN] ${guild.id} added the bot. Owner: ${guild.ownerId}`);

    // TODO send new guild to webhook
};