module.exports = async (client, guild) => {
    if (!guild.available) return; // If there is an outage, return.
    
    client.logger.log(`[GUILD LEAVE] ${guild.id} removed the bot.`);
  
    //await client.requester.deleteGuild(guild);

    // If the settings Enmap contains any guild overrides, remove them.
    // No use keeping stale data!
    if (client.settings.guild.has(guild.id))
      client.settings.guild.delete(guild.id);

    
    if (process.env.NODE_ENV === 'production') {
      const serverInfoEmbed = new MessageEmbed()
        .setTitle('Guild Leave')
        .setColor(0xFF0000)
        .addField('name', '`' + guild.name + '`', true)
        .addField('members', '`' + guild.memberCount + '`', true)
        .setThumbnail(guild.iconURL());
  
      client.guilds.cache.get('943940069935427635').channels.cache.get('945297306675187742').send({ embeds: [serverInfoEmbed] });
    }
};