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

    warpEngine: {
        fuel: { type: Number, default: 0 },
        fuelMax: { type: Number, default: 100 },
        class: { type: Number, default: 1 }
    },
    jumpEngine: {
        fuel: { type: Number, default: 10 },
        fuelMax: { type: Number, default: 10 },
        class: { type: Number, default: 1 }
    },

    armor: {},
    shields: {},
    cargo: {},
    fuel: { type: Number }
});

module.exports = mongoose.model("Ship", schema);