const mongoose = require("mongoose");

const schema = mongoose.Schema({
    // Discord
    discordId: { type: String },
    discordUsername: { type: String },
    discordDiscriminator: { type: Number },

    // Slack
    slackId: { type: String },
    
    // Username, email, password used for later online play and account linking
    username: { type: String },
    email: { type: String },
    password: { type: String },

    rank: { type: String, default: 'Drifter'},
    
    // Prefix used for the bot, currently resides client side
    prefix: { type: String },
    
    /* STATS */
	registeredAt: { type: Number, default: Date.now() }, // Registered date of the user

    ship: { type: mongoose.Schema.ObjectId, ref: 'Ship' },

    planets: {},
   
    /* COOLDOWN */
	cooldowns: { type: Object, default: {
		rep: 0
	}},
});


module.exports = mongoose.model("User", schema);