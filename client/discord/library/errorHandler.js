const { v1: uuidv1 } = require('uuid');

module.exports = client => {
    return {
        send: async function(context, err, guild, message, interaction) {
            const error = err;

            client.logger.error(`There was an error in the ${context}:`);
            client.logger.error(JSON.stringify({ errorMessage: error.message, errorStack: error.stack }));

            //Sentry.captureException(error);

            const errorId = uuidv1();

            const errorEmbed = client.extends.embed({ color: 'error' });
            errorEmbed.setTitle(`${context} error ${guild ? "in " + guild : "from an unknown source"}.`);
            errorEmbed.setDescription(client.helpers.substring(error.message, 2000));
            errorEmbed.addField(
                "Stack Trace:",
                `\`\`\`\n${client.helpers.substring(error.stack || "null", 1000)}\n\`\`\``
            );
            errorEmbed.addField("Error ID", errorId);
            errorEmbed.setTimestamp();

            if (message) {
                errorEmbed.addField(
                  "Message Content:",
                  client.helpers.substring(message.content, 1000)
                );
            }

            if (interaction) {
                errorEmbed.addField(
                  "Interaction Details",
                  client.helpers.substring(
                    `${interaction.commandName} ${
                      interaction.isCommand()
                        ? interaction.options.getSubcommand() || ""
                        : ""
                    }`,
                    1000
                  )
                );
                errorEmbed.addField(
                  "Interaction Options",
                  client.helpers.substring(
                    interaction.options.data[0].options
                      ?.map((o) => `\`${o.name}\`: ${o.value}`)
                      .join(", ") || "no options",
                    1000
                  )
                );
            }

            await client.debugHook.send({ embeds: [errorEmbed] });

            return errorId;
        }
    }
}