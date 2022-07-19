module.exports = client => {
    return {
        requireScan: async function(message, title)  {
            const sectorEmbed = client.extends.embed();
            sectorEmbed.title = title;
            sectorEmbed.description = `Cannot display sector until a \`scan\` has been completed.`;
            
            const btnScan = client.extends.button({
                id: 'btn_scan',
                label: 'Scan Sector',
                style: 'PRIMARY'
            });
            
            const buttons = client.extends.row()
                .addComponents(btnScan);

            const sectorMessage = await message.channel.send({
                embeds: [sectorEmbed],
                components: [buttons]
            });

            const collector = client.extends.collector(sectorMessage, message.author);

            collector.on('collect', async (i) => {
                switch(i.customId) {
                    case "btn_scan":
                        await client.container.commands.get('scan').run(client, message, args, level);
                        break;
                }
            });
        }
        
        emptySpace: async function(message, title) {
            const sectorEmbed = client.extends.embed();
            sectorEmbed.title = title;
            sectorEmbed.description = `There is nothing of interest in this sector, just empty space!

You can \`jump\` to another sector or \`scan\` the sector again.`;
            
            
            const btnScan = client.extends.button({
                id: 'btn_scan',
                label: 'Scan Sector',
                style: 'PRIMARY'
            });

            const btnJump = client.extends.button({
                id: 'btn_jump',
                label: 'Jump',
                style: 'PRIMARY'
            });

            const btnMap = client.extends.button({
                id: 'btn_map',
                label: 'Map',
                style: 'PRIMARY'
            });
            const buttons = client.extends.row()
                .addComponents(btnScan)
                .addComponents(btnJump)
                .addComponents(btnMap);

            const sectorMessage = await message.channel.send({
                embeds: [sectorEmbed],
                components: [buttons]
            });

            const collector = client.extends.collector(sectorMessage, message.author);

            collector.on('collect', async (i) => {
                switch(i.customId) {
                    case "btn_scan":
                        await client.container.commands.get('scan').run(client, message, args, level);
                        break;
                    case "btn_jump":
                        await client.container.commands.get('jump').run(client, message, args, level);
                        break;
                    case "btn_map":
                        await client.container.commands.get('map').run(client, message, args, level);
                        break;
                }
            });
        }
    };
};