module.exports = async (client, guild) => {
    client.logger.log(`[GUILD JOIN] ${guild.id} added the bot. Owner: ${guild.ownerId}`);
  
    //await client.requester.getGuild(guild);

    if (process.env.NODE_ENV === 'production') {
      const serverInfoEmbed = new MessageEmbed()
        .setTitle('Guild Join')
        .setColor(0x348a58)
        .addField('owner', `<@!${guild.ownerId}>`, true)
        .addField('name', '`' + guild.name + '`', true)
        .addField('members', '`' + guild.memberCount + '`', true)
        .setThumbnail(guild.iconURL());
  
      client.guilds.cache.get('943940069935427635').channels.cache.get('945297306675187742').send({ embeds: [serverInfoEmbed] });
    }
};