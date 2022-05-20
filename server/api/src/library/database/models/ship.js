const mongoose = require("mongoose");

const schema = mongoose.Schema({
    name: { type: String, default: 'none' },
    class: { type: String, default: 'Explorer' },
    xp: { type: Number, default: 0 },
    level: { type: Number, default: 1 },

    galaxy: { type: mongoose.Schema.ObjectId, ref: 'Galaxy' },
    sector: { type: mongoose.Schema.ObjectId, ref: 'Sector' },

    position: { 
        x: { type: Number, default: 49 },
        y: { type: Number, default: 31 },
        z: { type: Number, default: 0 }
    },

    warpDrive: {
        fuel: { type: Number, default: 0 },
        fuelMax: { type: Number, default: 100 },
        class: { type: Number, default: 1 },
        level: { type: Number, default: 1 },
        levelMax: { type: Number, default: 3 }
    },
    jumpDrive: {
        fuel: { type: Number, default: 10 },
        fuelMax: { type: Number, default: 10 },
        class: { type: Number, default: 1 },
        level: { type: Number, default: 1 },
        levelMax: { type: Number, default: 1 }
    },
    shields: {
        level: { type: Number, default: 1 },
        levelMax: { type: Number, default: 1 }
    },
    sensors: {
        level: { type: Number, default: 1 },
        levelMax: { type: Number, default: 5 }
    },
    cargo: [{
        type: { type: String },
        amount: { type: Number }
    }],
    fuel: { type: Number },

    /* COOLDOWN */
	cooldowns: { 
		mining: { type: Number }
	}
});

module.exports = mongoose.model("Ship", schema);