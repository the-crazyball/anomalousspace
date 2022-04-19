const {
    MessageActionRow,
    MessageButton,
    MessageEmbed,
    MessageSelectMenu,
    MessageAttachment
} = require('discord.js');

module.exports = client => {
    return {
        attachment: function(img, name) {
            return new MessageAttachment(img, name)
        },
        embedPages: function() {
            
        },
        embed: function(blueprint = {}) {
            const colors = {
                default: client.config.embed_color,
                red: '#fc0303'
            };

            return new MessageEmbed()
                .setColor(blueprint.color ? colors[blueprint.color] : colors['default'])
        },
        row: function() {
            return new MessageActionRow()
        },
        button: function(blueprint) {
            return new MessageButton()
                .setCustomId(blueprint.id)
                .setLabel(blueprint.label)
                .setStyle(blueprint.style)
                .setEmoji(blueprint.emoji)
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
    }
}