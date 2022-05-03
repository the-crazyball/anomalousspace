module.exports = async client => {

    // send message to webhook
    const disconnectEmbed = client.extends.embed({ color: 'error' });
    disconnectEmbed.setTitle("Anomalous Space bot has disconnected");
    disconnectEmbed.setDescription(
      `${client.user.username || "Anomalous Space"} is no longer connected to Discord.`
    );
    disconnectEmbed.setTimestamp();
    
    await client.debugHook.send({ embeds: [disconnectEmbed] });

  };