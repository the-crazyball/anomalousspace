const Grid = require('../library/map/grid');

exports.run = async (client, message, args, level) => { // eslint-disable-line no-unused-vars
    try {
        const settings = message.settings;

        let imageCounter = 0;

        let userData = await client.requester.getUser(message.member.user);

        if (!userData.ship) {
            await client.container.commands.get('play').run(client, message, args, level);
            return
        }

        let mapData = null;
        let sectors = [];
        let embedMsg = null;
        let selectedJumpToSector = null;
        const depth = userData.ship.jumpEngine.class; // this is the jump engines level/class, determines max jump distance

        const errorMsg = async () => {
            const embedMsg = client.extends.embed();
            embedMsg.title = 'Oops...';
            embedMsg.description = `You have entered invalid coordinates.\n\nUse: \`${settings.prefix} warp {x} {y}\`\n\n⦁ \`{x}\` number in the positive or negative range.\n⦁ \`{y}\` number in the positive or negative range.`;

            await message.channel.send({
                embeds: [embedMsg], components: [], files: [], attachments: []
            });
        }

        const jumpFail = async ({ x, y, reason }) => {
            const embedMsg = client.extends.embed();
            embedMsg.title = 'Oops...';
            embedMsg.description = `System malfunction, unable to jump to sector \`${x}\`, \`${y}\`, the jump drive didn't complete it's full cycle as expected. Running diagnostics...\n\nDiagnostics Result:\n\n⦁ \`${reason}\``;

            await message.channel.send({
                embeds: [embedMsg], components: [], files: [], attachments: []
            });
        }

        const generateJumpMap = async ({ jumpTo = null }) => {

            const { canvas, context } = await client.helpers.createMapCanvas(650, 635);

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
                        const imgSize = 70 * sectorData.type.diameter;
                        context.drawImage(client.images.get(sectorData.type.class), 0, 0, 1024, 1024, h.centerPixel.x - (imgSize / 2), h.centerPixel.y - (imgSize / 2), imgSize, imgSize);
                    }
                } else {
                    const imgSize = 100;
                    context.drawImage(client.images.get('unknown'), 0, 0, 512, 512, h.centerPixel.x - (imgSize / 2), h.centerPixel.y - (imgSize / 2), imgSize, imgSize);
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
        
                context.font = "25px Unispace Regular";
                context.fillStyle = "#ffffff";
                const x = userData.ship.position.x - h.q;
                const y = userData.ship.position.y - h.r;
                const textWidth = context.measureText(`${x},${y}`).width
                context.fillText(`${x},${y}`, h.centerPixel.x - textWidth / 2, h.centerPixel.y + h.height / 2 - 40);
        
        
                if (h.q === 0 && h.r === 0) {
                    context.beginPath()
                    context.lineWidth = 1;
                    context.arc(h.centerPixel.x, h.centerPixel.y, h.size-15, 0, 2 * Math.PI);
                    context.strokeStyle = "#ffffff";
                    context.stroke()
                    context.closePath()
                } 

                
            });

            if(jumpTo) {
                const toSector = jumpTo.split(',');
                const sectorData = hexGrid.allToList().find(hex => hex.q === parseInt(toSector[0]) && hex.r === parseInt(toSector[1]));
                
                // create line and arrow
                const x1 = 0;
                const y1 = 0;
                const x2 = sectorData.centerPixel.x;
                const y2 = sectorData.centerPixel.y;

                var arrow = 0.9;

                let dx = x2 - x1;
                let dy = y2 - y1;

                const middleX = dx * arrow + x1;
                const middleY = dy * arrow + y1;

                context.beginPath()
                context.lineWidth = 1;
                context.moveTo(0, 0)
                context.lineTo(middleX, middleY)
                context.strokeStyle = 'rgba(19, 165, 28, 1.0)';
                context.stroke()
                context.closePath()

                // draw arrow head
                dx = x2 - middleX;
                dy = y2 - middleY;
                context.beginPath();
                context.fillStyle = 'rgba(19, 165, 28, 1.0)';
                context.moveTo(middleX + 0.5 * dy, middleY - 0.5 * dx);
                context.lineTo(middleX - 0.5 * dy, middleY + 0.5 * dx);
                context.lineTo(x2, y2);
                context.closePath();
                context.fill()

                // highlight hex
                const pixels = [0, 1, 2, 3, 4, 5].map(v => client.helpers.pointyHexPixel(sectorData.centerPixel, sectorData.size, v));
                const startPixel = pixels[0];

                context.beginPath()
                context.moveTo(startPixel.x, startPixel.y)
                for (let i = 1; i <= 5; i++) {
                    context.lineTo(pixels[i].x, pixels[i].y)
                }
                context.lineTo(startPixel.x, startPixel.y)
                context.fillStyle = 'rgba(19, 165, 28, 1.0)';
                context.lineWidth = 4;
                context.stroke()
                context.closePath()
            }
    

            const attachment = client.extends.attachment(canvas.toBuffer(), `image${imageCounter}.png`);
            imageCounter++;

            return attachment
        }

        // using args from the command entered for coordinates to warp to
        // example: 23 56 0 (x, y, z)
        // note that z is not used is always 0 at the moment, for future expansion

        // if no coordinates entered show jump map with surrounding sectors that the ship can jump to
        // with the current jump engine level/class.
        if (!args[0]) {
            
            mapData = await client.requester.getMap(message.member.user, { depth: depth });

            embedMsg = client.extends.embed();
            embedMsg.image = {
                url: `attachment://image${imageCounter}.png`
            }

            const sectorImage = await generateJumpMap({});
        
            mapData.hexes.forEach(h => {
                if (h.q === 0 && h.r === 0) {
                    
                } else {
                    const x = userData.ship.position.x - h.q;
                    const y = userData.ship.position.y - h.r;
                    sectors.push({
                        label: `${x}, ${y}`,
                        description: `Jumping to this sector will cost 0 fuel.`,
                        value: `${h.q},${h.r}`
                    })
                }
            })

            const sectorSelect = client.extends.select({
                id: 'select_sector',
                placeHolder: 'Jump to...',
                options: sectors
            });

            const row = client.extends.row().addComponents(sectorSelect)

            embedMsg.title = `Jump`;
        
            const jumpMsg = await message.channel.send({
                embeds: [embedMsg], components: [row], files: [sectorImage], attachments: []
            });

            const collector = client.extends.collector(jumpMsg, message.author);

            collector.on('collect', async (i) => {
                if (i.customId === "btn_jump") {
                    const toSector = selectedJumpToSector.split(',');

                    const x = userData.ship.position.x - parseInt(toSector[0]);
                    const y = userData.ship.position.y - parseInt(toSector[1]);
                    const z = 0;

                    // TODO change to jumpTo engine
                    let returnData = await client.requester.jumpTo(message.member.user, {
                        toCoord: {
                            x: x,
                            y: y,
                            z: z
                        }
                    });

                    if (returnData.canJump) {
                        embedMsg.title = 'Jump Completed'
                        embedMsg.description = `You successfully jumped to sector \`${x}\`,\`${y}\`.`;
                
                        await jumpMsg.edit({
                            embeds: [embedMsg], components: [], files: [], attachments: []
                        });
                    } else {
                        jumpFail({ x, y, reason: 'Jump drive level to low to jump that far away.' });
                    }
                }
                if (i.customId === "select_sector") {
                    sectorSelect.options.forEach(r => {
                        if (r.value === i.values[0]) r.default = true;
                        else r.default = false;
                    });

                    selectedJumpToSector = i.values[0];

                    embedMsg.image = {
                        url: `attachment://image${imageCounter}.png`
                    }

                    const sectorImage = await generateJumpMap({ jumpTo: i.values[0] });

                    const btnJump = client.extends.button({
                        id: 'btn_jump',
                        label: 'Activate Jump',
                        style: 'PRIMARY'
                    })

                    const row2 = client.extends.row().addComponents(btnJump)

                    await jumpMsg.edit({
                        embeds: [embedMsg], components: [row, row2], files: [sectorImage], attachments: []
                    });
                }
            });

            return
        }

        // if coordinates entered then attempt to jump there.
        if (args[0] && (!client.helpers.isInteger(args[0]) || !client.helpers.isInteger(args[1]))) {
            errorMsg();

            return;
        }

        // TODO check for local sectors, prevent from jumping too far
        const x = args[0] || null;
        const y = args[1] || null;
        const z = 0;

        let returnData = await client.requester.jumpTo(message.member.user, {
            toCoord: {
                x: x,
                y: y,
                z: z
            }
        });

        if (returnData.canJump) {
            embedMsg = client.extends.embed();
            embedMsg.title = 'Jump Completed'
            embedMsg.description = `You successfully jumped to sector \`${x}\`,\`${y}\`.`;

            await message.channel.send({
                embeds: [embedMsg], components: [], files: [], attachments: []
            });
        } else {
            jumpFail({ x, y, reason: 'Jump drive level to low to jump that far away.' });
        }
    } catch (err) {
        const errorId = await client.errorHandler.send(
          "Jump command",
          err,
          message.guild.name,
          message,
          undefined
        );
        await message.channel.send({
          embeds: [client.extends.errorEmbed("jump", errorId)],
        });
    }
};

exports.conf = {
    enabled: true,
    guildOnly: false,
    aliases: [],
    permLevel: "User",
    requiresAPIConnection: true
};

exports.help = {
    name: "jump",
    category: "Game",
    description: "Jump is used to travel between sectors 1-2 sectors at a time.",
    usage: "jump",
    rootCmd: false
};