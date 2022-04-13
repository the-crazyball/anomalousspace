module.exports = client => {
    return {
        /*
        PERMISSION LEVEL FUNCTION
        This is a very basic permission system for commands which uses "levels"
        "spaces" are intentionally left black so you can add them if you want.
        NEVER GIVE ANYONE BUT OWNER THE LEVEL 10! By default this can run any
        command including the VERY DANGEROUS `eval` and `exec` commands!
        */
        permlevel: function(message) {
            let permlvl = 0;

            const permOrder = message.config.permLevels.slice(0).sort((p, c) => p.level < c.level ? 1 : -1);

            while (permOrder.length) {
                const currentLevel = permOrder.shift();
                if (message.guild && currentLevel.guildOnly) continue;
                if (currentLevel.check(message)) {
                    permlvl = currentLevel.level;
                    break;
                }
            }
            return permlvl;
        },
        getGuildSettings: function(guild) {
            client.settings.guild.ensure("default", client.config.defaultSettings);
            if (!guild) return client.settings.guild.get("default");
            const guildConf = client.settings.guild.get(guild.id) || {};
            // This "..." thing is the "Spread Operator". It's awesome!
            // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Spread_syntax
            return ({...client.settings.guild.get("default"), ...guildConf});
        },
        getUserSettings: function(user) {
            //client.settings.guild.ensure("default", client.config.defaultSettings);
            //if (!guild) return client.settings.guild.get("default");
            const userConf = client.settings.user.get(user.id) || {};
            // This "..." thing is the "Spread Operator". It's awesome!
            // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Spread_syntax
            return ({...client.settings.user.get("default"), ...userConf});
        },
        numberWithCommas: function(num) {
            return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
        },
        isInteger: function(value) {
            //return (typeof n == 'number' && /^[-]?[0-9]+$/.test(n+''));
            return /^-?\d+$/.test(value);
        }
    }
}