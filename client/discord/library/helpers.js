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
        },
        pointyHexPixel: function(center, size, i)  {
            const angleDeg = 60 * i - 30;
            const angleRad = Math.PI / 180 * angleDeg;
            return { x: center.x + size * Math.cos(angleRad), y: center.y + size * Math.sin(angleRad) };
        },
        createMapCanvas: async function(width, height) {
            client.canvas.registerFont('../shared/fonts/unispace/unispace rg.ttf', { family: 'Unispace Regular' });
            const canvas = client.canvas.createCanvas(width, height);
            const context = canvas.getContext('2d');
            const background = await client.canvas.loadImage('../shared/images/back.jpg');

            context.drawImage(background, 0, 0);

            context.setTransform(1, 0, 0, 1, canvas.width / 2 | 0, canvas.height / 2 | 0);
            context.imageSmoothingEnabled = false;

            return {
                canvas,
                context
            };
        },
        substring: function(str, len) {
            return str.length > len ? str.substring(0, len - 3) + "..." : str;
        },
        // toProperCase(String) returns a proper-cased string such as:
        // toProperCase("Mary had a little lamb") returns "Mary Had A Little Lamb"
        toProperCase: function(string) {
            return string.replace(/([^\W_]+[^\s-]*) */g, (txt) => txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase());
        }
    };
};