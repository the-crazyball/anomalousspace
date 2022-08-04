module.exports = client => {
    return {
        start: async function()  {
            // cooldown checks and DM
            const cd = (5 * 60 * 1000); // 5 min

            setInterval(() => {
                client.settings.notifier.forEach(async (value, key) => {
                    const now = new Date().getTime();

                    if ((now - value.cooldowns.mining > cd) && value.cooldowns.mining !== 0) {
                        const user = await client.users.fetch(key.toString());

                        if (user) {
                            const embed = client.extends.embed();
                            embed.title = 'Mining Ready!';
                            embed.description = `The mining cooldown is now __**completed**__.\n\nFeel free to start mining again when you have time.\n\n*Please Note: These notifications can be turned off in the bot settings.*`;
                            embed.setThumbnail('https://i.ibb.co/KDGh8m6/6400115.png');
                            await user.send({ embeds: [embed] });
                        }
                        client.settings.notifier.set(key, { cooldowns: { mining: 0 } });
                    }
                });
            }, 15000);
        }
    };
};