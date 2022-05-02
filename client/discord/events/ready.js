module.exports = async client => {

  client.logger.log(`${client.user.tag}, ready to serve ${client.guilds.cache.map(g => g.memberCount).reduce((a, b) => a + b)} users in ${client.guilds.cache.size} servers.`, "ready");

  // send message to webhook
  const readyEmbed = client.extends.embed({ color: 'success' });
  readyEmbed.setTitle("Anomalous Space bot is online");
  readyEmbed.setDescription(
    `${client.user.username || "Anomalous Space"} has come online.`
  );
  readyEmbed.setTimestamp();
  readyEmbed.setFooter({ text: 'Version 0.1' });

  await client.debugHook.send({ embeds: [readyEmbed] });

  setInterval(async () => {

    /* Activity types
    0	Game	Playing {name}	"Playing Rocket League"
    1	Streaming	Streaming {details}	"Streaming Rocket League"
    2	Listening	Listening to {name}	"Listening to Spotify"
    3	Watching	Watching {name}	"Watching YouTube Together"
    4	Custom	{emoji} {name}	":smiley: I am cool"
    5	Competing	Competing in {name}	"Competing in Arena World Champions"
    */
    const status = [{
        name: `${client.config.defaultSettings.prefix} play • ${client.guilds.cache.size} servers`,
        type: "WATCHING"
      }
    ]

    client.user.setActivity(status[0].name, {
      type: status[0].type
    });

  }, 20000); // Every 20 seconds
};