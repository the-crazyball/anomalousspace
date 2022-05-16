const mongoose = require("mongoose");

// planets, anomalies, meteors, asteroids
const schema = mongoose.Schema({
    objectId: { type: Number },

    name: { type: String },
    object: { type: String },
    class: { type: String },
    type: { type: String },

    resources: { 
        thorium: { type: Number },
        plutonium: { type: Number },
        uranium: { type: Number },
        rock: { type: Number }
    },
    colonies: { type: Number },
    distance: { type: Number },
    diameter: { type: Number },
    temperature: { type: Number },
    population: { type: Number },
    ring: { type: Number },

    satellites: { type: [{
        diameter: { type: Number }
    }]},

    sector: { type: mongoose.Schema.ObjectId, ref: 'Sector' },

    ownedBy: { type: mongoose.Schema.ObjectId, ref: 'User' }
});

module.exports = mongoose.model("AstronomicalObject", schema);