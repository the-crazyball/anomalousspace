// Check for correct Node version
if (Number(process.version.slice(1).split(".")[0]) < 16) throw new Error("Node 16.x or higher is required. Update Node on your system.");

const { Client, Collection, WebhookClient } = require('discord.js');
const { readdirSync } = require("fs");
const logger = require("./library/logger");
const canvas = require('canvas');
const config = process.env.NODE_ENV === 'prod' ? require("./config.prod") : require("./config.dev");

const client = new Client({ intents: config.intents, partials: config.partials });

const commands = new Collection();
const aliases = new Collection();

const levelCache = {};
for (let i = 0; i < config.permLevels.length; i++) {
  const thisLevel = config.permLevels[i];
  levelCache[thisLevel.name] = thisLevel.level;
}

client.container = {
  commands,
  aliases,
  levelCache
};

client.debugHook = new WebhookClient({ url: config.webhook });
client.logHook = new WebhookClient({ url: config.logwebhook });
client.canvas = canvas;
client.config = config;
client.settings = require("./library/settings");
client.logger = logger;
client.requester = require("./library/requester")(client);
client.helpers = require("./library/helpers")(client);
client.extends = require("./library/extends")(client);
client.errorHandler = require("./library/errorHandler")(client);

const init = async () => {

  const emojis = new Map();
  emojis.set('bullet', '<:bullet2:962045846462029835>');
  emojis.set('planet:desert', '<:planet_desert:962037563231715338>');
  emojis.set('planet:rock', '<:planet_rock:962047597214838914>');
  emojis.set('planet:ocean', '<:planet_ocean:962048027953090660>');
  emojis.set('resource:thorium', '<:resource_thorium:962030123752759399>');
  emojis.set('resource:plutonium', '<:resource_plutonium:962030124037963867>');
  emojis.set('resource:uranium', '<:resource_uranium:962030123824083044>');
  emojis.set('resource:rock', '<:resource_rock2:962029930466668595>');


  client.customEmojis = emojis;

  // load images needed for canvas, load once and reuse
  const starImages = new Map();
  starImages.set('M', await client.canvas.loadImage('../shared/images/stars/star_red01.png'))
  starImages.set('K', await client.canvas.loadImage('../shared/images/stars/star_red_giant01.png'))
  starImages.set('G', await client.canvas.loadImage('../shared/images/stars/star_yellow01.png'))
  starImages.set('F', await client.canvas.loadImage('../shared/images/stars/star_white01.png'))
  starImages.set('A', await client.canvas.loadImage('../shared/images/stars/star_white_giant01.png'))
  starImages.set('B', await client.canvas.loadImage('../shared/images/stars/star_blue01.png'))
  starImages.set('O', await client.canvas.loadImage('../shared/images/stars/star_blue_giant01.png'))
  starImages.set('unknown', await client.canvas.loadImage('../shared/images/question-mark.png'))
  starImages.set('ofinterest', await client.canvas.loadImage('../shared/images/exclamation-mark.png'))

  // BH (blackhole)
  // AN (anomaly)
  // WH (wormhole)

  client.images = starImages;


  // game related commands are loaded in the game loader.
  const commands = readdirSync("./commands/").filter(file => file.endsWith(".js"));
  for (const file of commands) {
    const props = require(`./commands/${file}`);
    logger.log(`Loading Command: ${props.help.name}. 👌`, "log");
    client.container.commands.set(props.help.name, props);
    props.conf.aliases.forEach(alias => {
      client.container.aliases.set(alias, props.help.name);
    });
  }
  
  const eventFiles = readdirSync("./events/").filter(file => file.endsWith(".js"));
  for (const file of eventFiles) {
    const eventName = file.split(".")[0];
    logger.log(`Loading Event: ${eventName}. 👌`, "log");
    const event = require(`./events/${file}`);
    // Bind the client to any event, before the existing arguments
    // provided by the discord.js event. 
    // This line is awesome by the way. Just sayin'.
    client.on(eventName, event.bind(null, client));
  }

  // These 2 process methods will catch exceptions and give *more details* about the error and stack trace.
  process.on("uncaughtException", async (err) => {
    await client.errorHandler.send("Uncaught Exception Error", err);

    //const errorMsg = err.stack.replace(new RegExp(`${__dirname}/`, "g"), "./");
    //logger.error(`Uncaught Exception: ${errorMsg}`);
    //console.error(err);
    // Always best practice to let the code crash on uncaught exceptions. 
    // Because you should be catching them anyway.
    process.exit(1);
  });

  process.on("unhandledRejection", async (err) => {
    await client.errorHandler.send("Unhandled Rejection Error", err);
    //logger.error(`Unhandled rejection: ${err}`);
    //console.error(err);
  });

  client.login(config.token);
};

init();