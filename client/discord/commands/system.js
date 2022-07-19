exports.run = async (client, message, args, level) => { // eslint-disable-line no-unused-vars
    try {
        const userData = await client.requester.send({
            method: 'getUser',
            user: message.member.user
        });

        if (!userData.ship) {
            await client.container.commands.get('play').run(client, message, args, level);
            return;
        }

        const { sector: sectorData, scanned } = await client.requester.send({
            method: 'getSector',
            user: message.member.user
        });

        const title = `System`;

        if (!scanned) {
            await client.common.requireScan(message, title, args, level);
            return;
        }

        const { canvas, context } = await client.helpers.createMapCanvas(700, 400);
        context.setTransform(1, 0, 0, 1, 0, 0); // set to default transform

        let imageCounter = 0;

        const embedMsg = client.extends.embed();
        embedMsg.image = {
            url: `attachment://image${imageCounter}.png`
        };

        if (sectorData.stellarObjects.length) {
            const stellarObjects = sectorData.stellarObjects[0];

            let scale = 1.0;

            let systemSize = 0;

            // determine scale based on how large the system is.
            sectorData.astronomicalObjects.forEach(o => {
                systemSize += o.distance;
            });

            // TODO make this better....
            switch(true) {
                case (systemSize >= 324 && systemSize <= 495):
                    scale = 0.5;
                    break;
                case (systemSize >= 280 && systemSize <= 323):
                    scale = 0.6;
                    break;
                case (systemSize >= 250 && systemSize <= 279):
                    scale = 0.6;
                    break;
                case (systemSize >= 125 && systemSize <= 249):
                    scale = 0.7;
                    break;
            }

            // draw HZ
            context.beginPath();
            context.arc(
                0,
                (canvas.height / 2),
                stellarObjects.hzInner*60,
                0,
                -2 * Math.PI, // negative -2 here, canvas bug https://github.com/Automattic/node-canvas/issues/1808
                true
            );
            context.arc(
                0,
                (canvas.height / 2),
                stellarObjects.hzOuter*60,
                0,
                2 * Math.PI,
                true
            );
            context.closePath();

            //context.filter = "blur(16px)";
            context.fillStyle = 'rgba(72, 245, 39, 0.3)';
            context.fill();

            // draw the sun
            const starRadius = (100 + (stellarObjects.radius * 50)) * scale;

            context.translate(0, 0);
            context.scale(scale, scale);

            context.drawImage(client.images.get(stellarObjects.class), 0, 0, 1024, 1024, 0 - (starRadius / 2), ((canvas.height / 2) / scale) - (starRadius / 2), starRadius, starRadius);

            sectorData.astronomicalObjects.forEach(o => {

                const startX = 0;
                const startY = canvas.height / 2;
                const radius = 25 + o.diameter; // 4 to 40
                const orbitRadius = o.distance * 20;

                // planet positions on arc
                const x = startX + Math.cos(0) * orbitRadius;
                const y = startY + Math.sin(0) * orbitRadius;

                if (o.object === 'planet') {
                    // Planet Path
                    context.beginPath();
                    context.setLineDash([1,1]);
                    context.lineWidth = 2;
                    context.arc(
                        startX,
                        startY / scale,
                        orbitRadius,
                        0,
                        Math.PI * 2,
                        false
                    );
                    context.strokeStyle = 'rgba(255, 255, 255, 0.2)';
                    context.stroke();
                    context.closePath();
                    // Moon (not sun)
                    /*if (this.velocity > 0) {
                        c.beginPath();
                        c.arc(this.moon.x, this.moon.y, 2, 0, Math.PI * 2, false);
                        c.fillStyle = 'gray';
                        c.fill();
                    }*/

                    // draw planet
                    context.drawImage(client.images.get(o.type), 0, 0, 500, 500, x - (radius / 2), y / scale - (radius / 2), radius, radius);
                } else {
                    if (o.type === 'asteroid:belt') {
                        const asteroidsNum = o.asteroidsNum;
                        const orbitRadius = o.distance * 20;

                        for (let i = 0; i < asteroidsNum; i++) {
                            const x = Math.cos(i) * client.helpers.rndInt(orbitRadius - 30, orbitRadius + 30);
                            const y = ((canvas.height / scale) / 2) + Math.sin(i) * client.helpers.rndInt(orbitRadius - 30, orbitRadius + 30);

                            const radius = Math.random() * 15;

                            context.drawImage(client.images.get(o.type), 0, 0, 128, 128, x, y, radius, radius);
                        }
                    }
                }
            });
        }

        const attachment = client.extends.attachment(canvas.toBuffer(), `image${imageCounter}.png`);
        imageCounter++;

        embedMsg.title = title;

        await message.channel.send({
            embeds: [embedMsg], components: [], files: [attachment], attachments: []
        });
    } catch (err) {
        const errorId = await client.errorHandler.send(
            "System command",
            err,
            message.guild.name,
            message,
            undefined
        );
        await message.channel.send({
            embeds: [client.extends.errorEmbed("system", errorId)],
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
    name: "system",
    category: "Game",
    description: "View of the system in a sector.",
    usage: "system",
    rootCmd: false
};