const Grid = require('../library/map/grid');

exports.run = async (client, message, [action, key, ...value], level) => { // eslint-disable-line no-unused-vars
    const settings = message.settings;
    const depth = 2;

    let userData = await client.requester.getUser(message.member.user);

    if (!userData.ship) {
        await client.container.commands.get('play').run(client, message, [action, key, ...value], level);
        return
    }

    let mapData = await client.requester.getMap(message.member.user, { depth: depth });

    const { canvas, context } = await client.helpers.createMapCanvas(650, 600);

    let imageCounter = 0;
    
    const embedMsg = client.extends.embed();
    embedMsg.image = {
        url: `attachment://image${imageCounter}.png`
    }

    const d = Math.abs(depth)
    const gameWidth = canvas.width;

    const hexagonWidth = gameWidth / ((d * 2) + 1);
    const size = ~~(hexagonWidth / (Math.sqrt(3) / 2) / 2);

    const hexGrid = new Grid(depth, size);
    
    
    hexGrid.allToList().map(async h => {

        let exists = true;
        
        context.strokeStyle = "#38abc9";

        const pixels = [0, 1, 2, 3, 4, 5].map(v => client.helpers.pointyHexPixel(h.centerPixel, h.size, v))
        const startPixel = pixels[0]

        const sectorData = mapData.hexes.find(mapHex => mapHex.q === h.q && mapHex.r === h.r);

        if (sectorData.scanned) {
            if (sectorData.type) {
                const imgSize = 40 * sectorData.type.diameter;
                context.drawImage(client.images.get(sectorData.type.class), 0, 0, 1024, 1024, h.centerPixel.x - (imgSize / 2), h.centerPixel.y - (imgSize / 2), imgSize, imgSize);
            }
        } else {
            context.drawImage(client.images.get('unknown'), 0, 0, 512, 512, h.centerPixel.x - (50 / 2), h.centerPixel.y - (50 / 2), 50, 50);
        }

        context.beginPath()
        context.moveTo(startPixel.x, startPixel.y)
        for (let i = 1; i <= 5; i++) {
            context.lineTo(pixels[i].x, pixels[i].y)
        }
        context.lineTo(startPixel.x, startPixel.y)

        if (sectorData.visited) {
            context.fillStyle = 'rgba(56, 171, 201, 0.1)';
        } else {
            context.fillStyle = 'rgba(0, 0, 0, 0.2)';
        }
        context.fill();
        if (h.q === 0 && h.r === 0) {
            context.lineWidth = 4;
        } else {
            context.lineWidth = 1;
        }
        context.stroke()
        
        context.closePath()

        context.font = "14px Unispace Regular";
        context.fillStyle = "#ffffff";
        const x = userData.ship.position.x - h.q;
        const y = userData.ship.position.y - h.r;
        const textWidth = context.measureText(`${x},${y}`).width
        context.fillText(`${x},${y}`, h.centerPixel.x - textWidth / 2, h.centerPixel.y + h.height / 2 - 20);


        if (h.q === 0 && h.r === 0) {
            context.beginPath()
            context.lineWidth = 1;
            context.arc(h.centerPixel.x, h.centerPixel.y, h.size-15, 0, 2 * Math.PI);
            context.strokeStyle = "#ffffff";
            context.stroke()
            context.closePath()
        }
    });
    
    const attachment = client.extends.attachment(canvas.toBuffer(), `image${imageCounter}.png`);
    imageCounter++;

    embedMsg.title = `Map`;

    await message.channel.send({
        embeds: [embedMsg], components: [], files: [attachment], attachments: []
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
    name: "map",
    category: "Game",
    description: "Map of surrounding sectors.",
    usage: "map",
    rootCmd: false
};