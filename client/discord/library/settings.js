const Enmap = require("enmap");
// used for the user and guild specific settings, namely the command prefix.
// the rest should be stored on the server via API
module.exports = {
    guild: new Enmap({
        name: "guildSettings",
    }),
    user: new Enmap({
        name: "userSettings",
    }),
    notifier: new Enmap({
        name: "notifier",
    })
};