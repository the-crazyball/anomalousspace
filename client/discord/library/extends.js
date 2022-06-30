const {
    MessageActionRow,
    MessageButton,
    MessageEmbed,
    MessageSelectMenu,
    MessageAttachment,
    Modal,
    TextInputComponent
} = require('discord.js');

module.exports = client => {
    return {
        select: function(blueprint) {
            return new MessageSelectMenu()
                .setCustomId(blueprint.id)
                .setPlaceholder(blueprint.placeHolder)
                .addOptions(blueprint.options);
        },
        attachment: function(img, name) {
            return new MessageAttachment(img, name);
        },
        textInput: function(blueprint) {
            return new TextInputComponent()
                .setCustomId(blueprint.id)
                .setLabel(blueprint.label)
                .setRequired(blueprint.required ? true : false)
                .setStyle(blueprint.style); //IMPORTANT: Text Input Component Style can be 'SHORT' or 'LONG'
        },
        embedPages: function() {

        },
        errorEmbed: function(commandName, errorId) {
            const errorEmbed = this.embed({ color: 'error' });
            errorEmbed.setTitle('Unknown Error');
            errorEmbed.setDescription(`The \`${commandName}\` command was sucked up by a blackhole.`);
            errorEmbed.addField('What happened?', 'Something went wrong with this command.');
            errorEmbed.addField('Did I do something wrong?', `Errors can happen for a number of reasons. It could be an issue with the permissions, an error generated by the API server or something else completely.`);
            errorEmbed.addField(`So what can I do to fix it?`, `If you need assistance with this feature, please [join our support server](${client.config.supportServer}). Once there, give this \`ErrorID\` to the support team to investigate.`);
            errorEmbed.addField('Error ID:', `\`${errorId}\``);
            errorEmbed.setTimestamp();
            errorEmbed.setFooter({ text: `${client.config.copyright}` });

            return errorEmbed;
        },
        modal: function() {
            return new Modal();
        },
        embed: function(blueprint = {}) {
            const colors = {
                default: client.config.embed_color,
                red: '#fc0303',
                success: 0x1f8b4c,
                warning: 0xc27c0e,
                error: 0x992d22
            };

            const status = [
                'Created by an awesome team!',
                'Did you know the game is open source?',
                'The Anomalous Space universe has ≈ 1,000,000 galaxies.',
                'A galaxy can have up to 800 ancient hub cities.',
                'An anomaly will have an anomalous behavior...',
                'Made with ♥'
            ];
            const random = status[Math.floor(Math.random()*status.length)];

            return new MessageEmbed()
                .setColor(blueprint.color ? colors[blueprint.color] : colors['default'])
                .setFooter({ text: `"!s play" to start or "!s help" for help\n${random}` });
        },
        row: function() {
            return new MessageActionRow();
        },
        button: function(blueprint) {
            const button = new MessageButton();
            if (blueprint.style !== 'LINK') {
                button.setCustomId(blueprint.id);
            }
            if (blueprint.style === 'LINK') {
                button.setURL(blueprint.url);
            }
            if (blueprint.disabled) {
                button.setDisabled(blueprint.disabled);
            }
            button.setLabel(blueprint.label);
            button.setStyle(blueprint.style);
            if (blueprint.emoji) {
                button.setEmoji(blueprint.emoji);
            }

            return button;
        },
        messageCollector: function(interaction, max) {
            const filter = (m) => !m.author.bot && m.author.id === interaction.user.id;

            return interaction.channel.createMessageCollector({
                filter: filter,
                max: max,
                time: 120000 // in (ms) buttons timeout after this time
            });
        },
        collector: function(message, author) {
            // filter so make sure the button belongs to the person that initiated the command
            const filter = async i => {
                if (i.user.id === author.id) return true;
                return false;
            };

            return message.createMessageComponentCollector({
                filter,
                time: 1200000 // in (ms) buttons timeout after this time
            });
        }
    };
};