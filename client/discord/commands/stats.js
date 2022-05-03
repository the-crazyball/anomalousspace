const { version } = require("discord.js");
const si = require('systeminformation')
const humanizeDuration = require('humanize-duration')

exports.run = async (client, message, args, level) => { // eslint-disable-line no-unused-vars

  try {
    const cpu = await si.cpu()

    const APIStatus = await client.requester.healthCheck().then(true).catch(e => false);

    const reply = client.extends.embed();
    reply.title = 'Stats';
    reply.description = `\`\`\`asciidoc\n
• CPU        :: ${cpu.cores} Cores
• Mem Usage  :: ${(process.memoryUsage().heapUsed / 1024 / 1024).toFixed(2)} MB
• Uptime     :: ${humanizeDuration(client.uptime)}
• Users      :: ${client.guilds.cache.map(g => g.memberCount).reduce((a, b) => a + b).toLocaleString()}
• Servers    :: ${client.guilds.cache.size.toLocaleString()}
• Node       :: ${process.version}
• Discord.js :: v${version}
• Shards     :: ${parseInt(client.options.shards) + 1}

• API Server :: ${APIStatus ? 'ONLINE' : 'OFFLINE'}\`\`\``;


      message.channel.send({
        embeds: [reply] 
      })
      .catch(e => console.log(e))
    } catch (err) {
      const errorId = await client.errorHandler.send(
        "Stats command",
        err,
        message.guild.name,
        message,
        undefined
      );
      await message.channel.send({
        embeds: [client.extends.errorEmbed("stats", errorId)],
      });
  }
};

exports.conf = {
  enabled: true,
  guildOnly: false,
  aliases: [],
  permLevel: "Bot Admin",
  requiresAPIConnection: false
};

exports.help = {
  name: "stats",
  category: "Miscellaneous",
  description: "Gives some useful bot statistics",
  usage: "stats"
};