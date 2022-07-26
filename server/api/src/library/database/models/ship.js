const mongoose = require("mongoose");

const schema = mongoose.Schema({
    name: { type: String, default: 'none' },

    class: { type: String, default: 'Explorer' },
    tier: { type: Number, default: 1},
    hp: { type: Number, default: 120 },
    size: { type: String, default: 'small'},
    sizeNum: { type: Number, default: 2},

    galaxy: { type: mongoose.Schema.ObjectId, ref: 'Galaxy' },
    sector: { type: mongoose.Schema.ObjectId, ref: 'Sector' },

    position: { 
        x: { type: Number, default: 49 },
        y: { type: Number, default: 31 },
        z: { type: Number, default: 0 }
    },

    engine: {},

    cargo: [],

    modulesMax: { type: Number, default: 3 },
    modules: [],

    /* COOLDOWN */
	cooldowns: { 
		mining: { type: Number }
	}
});

module.exports = mongoose.model("Ship", schema);