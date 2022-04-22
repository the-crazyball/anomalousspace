const Grid = require('../library/map/grid');

exports.run = async (client, message, args, level) => { // eslint-disable-line no-unused-vars
    const settings = message.settings;

    let userData = await client.requester.getUser(message.member.user);

    if (!userData.ship) return;

    const errorMsg = async () => {
        const embedMsg = client.extends.embed();
        embedMsg.title = 'Oops...';
        embedMsg.description = `You have entered invalid coordinates.\n\nUse: \`${settings.prefix} warp {x} {y}\`\n\n⦁ \`{x}\` number in the positive or negative range.\n⦁ \`{y}\` number in the positive or negative range.`;

        await message.channel.send({
            embeds: [embedMsg], components: [], files: [], attachments: []
        });
    }

    // using args from the command entered for coordinates to warp to
    // example: 23 56 0 (x, y, z)
    // note that z is not used is always 0 at the moment, for future expansion

    if ((args[0] && (!client.helpers.isInteger(args[0]) || !client.helpers.isInteger(args[1]))) || !args[0]) {
        errorMsg();

        return;
    }

    const x = args[0] || null;
    const y = args[1] || null;
    const z = 0;

    let returnData = await client.requester.warpTo(message.member.user, {
        toCoord: {
            x: x,
            y: y,
            z: z
        }
    });

};

exports.conf = {
    enabled: true,
    guildOnly: false,
    aliases: [],
    permLevel: "User",
    requiresAPIConnection: true
};

exports.help = {
    name: "warp",
    category: "Game",
    description: "Warp is used to travel between sectors and systems.",
    usage: "warp",
    rootCmd: false
};