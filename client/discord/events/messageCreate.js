// The MESSAGE event runs anytime a message is received
// Note that due to the binding of client to every event, every event
// goes `client, other, args` when this function is run.

module.exports = async (client, message) => {
    // check if DM
    // TODO perhaps we can do something in DM later on?
    if (message.channel.type === 'DM') {
        return;
    }

    const permlevel = client.helpers.permlevel;
    const config = message.config = client.config;

    // Grab the container from the client to reduce line length.
    const { container } = client;

    // It's good practice to ignore other bots. This also makes your bot ignore itself
    // and not get into a spam loop (we call that "botception").
    if (message.author.bot) return;

    // Grab the settings for this server from Enmap.
    // If there is no guild, get default conf (DMs)
    // also get the user settings if they exists, more for the prefix settings at this point
    const settings = message.settings = client.helpers.getGuildSettings(message.guild);
    const userSettings = client.helpers.getUserSettings(message.member.user);

    const defaultPrefix = settings.prefix;

    if (userSettings.prefix)
        settings.prefix = message.settings.prefix = userSettings.prefix;

    // Checks if the bot was mentioned via regex, with no message after it,
    // returns the prefix. The reason why we used regex here instead of
    // message.mentions is because of the mention prefix later on in the
    // code, would render it useless.
    const prefixMention = new RegExp(`^<@!?${client.user.id}> ?$`);
    if (message.content.match(prefixMention)) {
        return message.reply(`My prefix to play is \`${settings.prefix}\``);
    }

    // It's also good practice to ignore any and all messages that do not start
    // with our prefix, or a bot mention.

    // TODO make sure this regex is working properly for prefix check....
    // ^\\

    const prefix = new RegExp(`^(${defaultPrefix}|${settings.prefix.toLowerCase()}|${settings.prefix.toUpperCase()}|<@!?${client.user.id}>)`).exec(message.content);

    // This will return and stop the code from continuing if it's missing
    // our prefix (be it mention or from the settings).

    if (!prefix) return;

    // Here we separate our "command" name, and our "arguments" for the command.
    // e.g. if we have the message "+say Is this the real life?" , we'll get the following:
    // command = say
    // args = ["Is", "this", "the", "real", "life?"]
    const args = message.content.slice(prefix[0].length).trim().split(/ +/g);

    const command = args.shift().toLowerCase();
    //let command = args.shift();
    //if (command) command = command.toLowerCase();

    // If the member on a guild is invisible or not cached, fetch them.
    if (message.guild && !message.member) await message.guild.members.fetch(message.author);

    // Get the user or member's permission level from the elevation
    const level = permlevel(message);

    // Check whether the command, or alias, exist in the collections defined
    // in index.js.
    const cmd = container.commands.get(command) || container.commands.get(container.aliases.get(command));
    // using this const varName = thing OR otherThing; is a pretty efficient
    // and clean way to grab one of 2 values!

    if (!cmd) return;

    // Some commands may not be useable in DMs. This check prevents those commands from running
    // and return a friendly error message.
    if (cmd && !message.guild && cmd.conf.guildOnly)
        return message.channel.send("This command is unavailable via private message. Please run this command in a guild.");

    if (!cmd.conf.enabled) return;

    if (level < container.levelCache[cmd.conf.permLevel]) {
        return message.channel.send(`You do not have permission to use this command.
Your permission level is ${level} (${config.permLevels.find(l => l.level === level).name})
This command requires level ${container.levelCache[cmd.conf.permLevel]} (${cmd.conf.permLevel})`);
    }

    // To simplify message arguments, the author's level is now put on level (not member so it is supported in DMs)
    message.author.permLevel = level;

    //message.flags = [];
    //while (args[0] && args[0][0] === "-") {
    //  message.flags.push(args.shift().slice(1));
    //}

    // need to do a healthcheck here before calling API. API is required for all commands
    // since it gets the guild/user prefix. Prefixes are configurable to guild or user and
    // stored in the database.
    if (cmd.conf.requiresAPIConnection) {
        const APIStatus = await client.requester.healthCheck().then(true).catch(() => false);
        if (!APIStatus) {
            const reply = client.extends.embed({ color: 'red' });
            reply.title = 'Error';
            reply.description = 'Could not connect to API server. Please try again later.';

            message.channel.send({ embeds: [reply] })
                .catch(e => console.log(e));

            return;
        }
    }

    // If the command exists, **AND** the user has permission, run it.
    try {
        await cmd.run(client, message, args, level);

        client.logger.log(`${config.permLevels.find(l => l.level === level).name} ${message.author.id} ran command ${cmd.help.name}`, "cmd");
    } catch (e) {
        await client.errorHandler.send(
            "message send event",
            e,
            message.guild.name,
            message
        );
        console.error(e);
        message.channel.send({
            content: `There was a problem with your request.\n\`\`\`${e.message}\`\`\``
        }).catch(e => console.error("An error occurred replying on an error", e));
    }
};
