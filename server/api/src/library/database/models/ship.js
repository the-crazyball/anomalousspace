const mongoose = require("mongoose");

const schema = mongoose.Schema({
    name: { type: String, default: 'none' },

    stats: {
        hp: { type: Number, default: 120 },
        hpMax: { type: Number, default: 120 },
        AP: { type: Number, default: 0 }, // attack power (tier + weapons)
        DP: { type: Number, default: 0 } // defense power (tier + shields + armor)

    },

    class: { type: String, default: 'Explorer' },
    tier: { type: Number, default: 1},
    tierMax: { type: Number, default: 10},
    size: { type: String, default: 'small'},
    sizeNum: { type: Number, default: 2},

    galaxy: { type: mongoose.Schema.ObjectId, ref: 'Galaxy' },
    sector: { type: mongoose.Schema.ObjectId, ref: 'Sector' },

    position: { 
        x: { type: Number, default: 49 },
        y: { type: Number, default: 31 },
        z: { type: Number, default: 0 }
    },

    //engine: {},
    //cargo: [],

    hangerMax: { type: Number, default: 5 },
    hanger: [],

    modulesMax: { type: Number, default: 3 },
    modules: [],

    /* COOLDOWN */
	cooldowns: { 
		mining: { type: Number }
	}
});

module.exports = mongoose.model("Ship", schema);