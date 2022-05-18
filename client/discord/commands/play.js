exports.run = async (client, message, [action, key, ...value], level) => { // eslint-disable-line no-unused-vars
    try {
        let userData = await client.requester.getUser(message.member.user);

        const startEmbed = client.extends.embed();

        let components = [];

        if (!userData.ship) {
            startEmbed.title = `Message from Star Command`;
            startEmbed.description = `Welcome ${message.author.toString()}, it has come to our attention that you are interested in helping us find and analyse the \`Unknown\` anomaly that appeared in our galaxy. 

Your \`Explorer\` class ship is ready to head out through the warp gate that will bring you close to the last known coordinates in Sector \`124\`,\`90\` the anomaly was last detected.

Also one last thing, we recently upgraded our warp gate to allow us to travel further out in our galaxy and reach this anomaly.

Good luck!`;
            startEmbed.addField('Current Location', `\`Orithyia Galaxy\` Sector \`-201\`,\`689\``, true);

            const btnWarp = client.extends.button({
                id: 'btn_warp',
                label: 'Enter Warp Gate',
                style: 'PRIMARY'
            });

            const buttons = client.extends.row()
                .addComponents(btnWarp);

            components.push(buttons);
        } else {
            startEmbed.title = `Hi ${message.author.username}`;
            startEmbed.description = `Welcome back! We are so glad you came back, we missed you so much!`;
        }

        const startMessage = await message.channel.send({
            embeds: [startEmbed],
            components: components
        });

        const collector = client.extends.collector(startMessage, message.author);

        collector.on('collect', async (i) => {
            if (i.customId === "btn_warp") {
                let result = await client.requester.warpStart(message.member.user);

                // send message to webhook
                const readyEmbed = client.extends.embed({ color: 'success' });
                readyEmbed.setTitle("New User");
                readyEmbed.setDescription(`New User: \`${result.discordUsername}\`\nGalaxy: \`${result.ship.galaxy.name}\`\nLocation: \`${result.ship.galaxy.x}\`,\`${result.ship.galaxy.y}\`,\`${result.ship.galaxy.z}\`\n\nSector Location: \`${result.ship.sector.x}\`,\`${result.ship.sector.y}\`,\`${result.ship.sector.z}\``);
                readyEmbed.setTimestamp();

                await client.logHook.send({ embeds: [readyEmbed] });

                const warpEmbed1 = client.extends.embed();
                warpEmbed1.title = `The Light`;
                warpEmbed1.description = `You enter the warp gate and suddenly feel as if you senses have intensified and see a bright light surrounding you and your ship....`;

                startMessage.edit({
                    embeds: [warpEmbed1],
                    components: []
                }).then(() => { // Wait until the first message is sent
                    setTimeout(() => {
                        const warpEmbed2 = client.extends.embed();
                        warpEmbed2.title = `An Unexpected Event`;
                        warpEmbed2.description = `Everything is going so fast... You hear something, a noise that you can't identify, you suddenly feel the ship turning out of control...`;

                        message.channel.send({
                            embeds: [warpEmbed2],
                            components: []
                        }).then(() => {
                            setTimeout(() => {
                                const warpEmbed3 = client.extends.embed();
                                warpEmbed3.title = `Did I die?`;
                                warpEmbed3.description = `You have a feeling that this is it, you are going to die!\n\nBut as soon as your thought of dying ends, the bright light disappears, the ship stops turning and starts difting in space.\n\nYou look around to get your bearings to see where you are...`;
                                //warpEmbed3.addField('Current Location', `\`Unknown\` Sector \`Unknown\``, true)

                                message.channel.send({
                                    embeds: [warpEmbed3],
                                    components: []
                                });

                            }, 2000);
                        });
                    }, 2000);
                });
            }
        });
    } catch (err) {
        const errorId = await client.errorHandler.send(
            "Play command",
            err,
            message.guild.name,
            message,
            undefined
        );
        await message.channel.send({
            embeds: [client.extends.errorEmbed("play", errorId)],
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
    name: "play",
    category: "Game",
    description: "Your star exploration starts here!",
    usage: "play",
    rootCmd: false
};