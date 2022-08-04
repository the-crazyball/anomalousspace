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
client.logger.init(config);
client.requester = require("./library/requester")(client);
client.helpers = require("./library/helpers")(client);
client.extends = require("./library/extends")(client);
client.errorHandler = require("./library/errorHandler")(client);
client.common = require("./library/common")(client);
client.notifier = require("./library/notifier")(client);
client.notifier.start();

const init = async () => {

    const emojis = new Map();
    emojis.set('bullet', '<:bullet3:992093405888909372>');
    emojis.set('planet:desert', '<:planet_desert:962037563231715338>');
    emojis.set('planet:rock', '<:planet_rock:962047597214838914>');
    emojis.set('planet:ocean', '<:planet_ocean:962048027953090660>');
    emojis.set('planet:gasgiant', '<:planet_gasgiant:981973058287980616>');
    emojis.set('planet:garden', '<:planet_garden:991700507787804722>');
    emojis.set('planet:ice', '<:planet_ice:991767011522777118>');
    emojis.set('resource:thorium', '<:resource_torsium1:992138949860540527>');
    emojis.set('resource:plutonium', '<:resource_plutonium1:992138947255869591>');
    emojis.set('resource:uranium', '<:resource_uranium1:992138950808436746>');
    emojis.set('resource:rock', '<:resource_rock1:992138948665159820>');
    emojis.set('bar:on', '<:bar_on:976936352279052308>');
    emojis.set('bar:off', '<:bar_off:976936352111263784>');
    emojis.set('bar:disabled', '<:bar_disabled:976940680347779102>');
    emojis.set('icon:github', '<:github:977315434216964106>');
    emojis.set('icon:hub', '<:icon_hub:984909417206141048>');
    emojis.set('icon:mininglaser', '<:mining_laser:1004114269312405516>');
    emojis.set('icon:cargohold', '<:cargo_hold:1004114285460463756>');
    emojis.set('icon:generator', '<:power:1004104890613768192>');
    emojis.set('icon:engine', '<:engine:1004103140804677785>');

    client.customEmojis = emojis;

    // load images needed for canvas, load once and reuse
    const astronomicalObjectImages = new Map();
    astronomicalObjectImages.set('M', await client.canvas.loadImage('../shared/images/stars/star_red01.png'));
    astronomicalObjectImages.set('K', await client.canvas.loadImage('../shared/images/stars/star_red_giant01.png'));
    astronomicalObjectImages.set('G', await client.canvas.loadImage('../shared/images/stars/star_yellow01.png'));
    astronomicalObjectImages.set('F', await client.canvas.loadImage('../shared/images/stars/star_white01.png'));
    astronomicalObjectImages.set('A', await client.canvas.loadImage('../shared/images/stars/star_white_giant01.png'));
    astronomicalObjectImages.set('B', await client.canvas.loadImage('../shared/images/stars/star_blue01.png'));
    astronomicalObjectImages.set('O', await client.canvas.loadImage('../shared/images/stars/star_blue_giant01.png'));
    astronomicalObjectImages.set('unknown', await client.canvas.loadImage('../shared/images/question-mark.png'));
    astronomicalObjectImages.set('ofinterest', await client.canvas.loadImage('../shared/images/exclamation-mark.png'));
    astronomicalObjectImages.set('icon:hub', await client.canvas.loadImage('../shared/images/hub.png'));

    // load planets images
    astronomicalObjectImages.set('planet:desert', await client.canvas.loadImage('../shared/images/planets/desert.png'));
    astronomicalObjectImages.set('planet:rock', await client.canvas.loadImage('../shared/images/planets/rock.png'));
    astronomicalObjectImages.set('planet:ocean', await client.canvas.loadImage('../shared/images/planets/ocean.png'));
    astronomicalObjectImages.set('planet:gasgiant', await client.canvas.loadImage('../shared/images/planets/gasgiant.png'));
    astronomicalObjectImages.set('planet:garden', await client.canvas.loadImage('../shared/images/planets/garden.png'));
    astronomicalObjectImages.set('planet:ice', await client.canvas.loadImage('../shared/images/planets/ice.png'));

    // load asteroids images
    astronomicalObjectImages.set('asteroid:belt', await client.canvas.loadImage('../shared/images/asteroids/asteroids.png'));

    // BH (blackhole)
    // AN (anomaly)
    // WH (wormhole)

    client.images = astronomicalObjectImages;

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