const mongoose = require("mongoose");

module.exports = settings => {
    const schema = mongoose.Schema({
        /* REQUIRED */
        id: { type: String }, // Discord ID of the guild
    
        /* CONFIGURATION */
        prefix: { type: String, default: settings.guild.prefix },

        name: { type: String },

        ownerId: { type: String }
    });

    return mongoose.model("Guild", schema);
}
