const Grid = require('../library/map/grid');

exports.run = async (client, message, [action, key, ...value], level) => { // eslint-disable-line no-unused-vars
    const settings = message.settings;
    const depth = 2;

    let userData = await client.requester.getUser(message.member.user);

    if (!userData.ship) return;

    let mapData = await client.requester.getMap(message.member.user, { depth: depth });

    const canvas = client.canvas.createCanvas(650, 600);
  	const context = canvas.getContext('2d');
    const background = await client.canvas.loadImage('../shared/images/back.jpg');

    context.drawImage(background, 0, 0);

    context.setTransform(1, 0, 0, 1, canvas.width / 2 | 0, canvas.height / 2 | 0);

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

        const sectorData = mapData.hexes.find(mapHex => mapHex.q === h.q && mapHex.r === h.r).type;

        if (sectorData) {
            const imgSize = 50 * sectorData.diameter;
            context.drawImage(client.images.get(sectorData.class), 0, 0, 1024, 1024, h.centerPixel.x - (imgSize / 2), h.centerPixel.y - (imgSize / 2), imgSize, imgSize);
        }

        

        context.beginPath()
        context.moveTo(startPixel.x, startPixel.y)
        for (let i = 1; i <= 5; i++) {
            context.lineTo(pixels[i].x, pixels[i].y)
        }
        context.lineTo(startPixel.x, startPixel.y)

        context.fillStyle = 'rgba(56, 171, 201, 0.1)';
        context.fill();
        if (h.q === 0 && h.r === 0) {
            context.lineWidth = 4;
        } else {
            context.lineWidth = 1;
        }
        context.stroke()
        
        context.closePath()

        context.font = "1px";
        context.fillStyle = "#ffffff";
        const x = userData.ship.sector.x - h.q;
        const y = userData.ship.sector.y - h.r;
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

    context.imageSmoothingEnabled = false;
    
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