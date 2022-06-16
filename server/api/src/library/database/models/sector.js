const mongoose = require("mongoose");

const schema = mongoose.Schema({
    name: { type: String },
    x: { type: Number },
    y: { type: Number },
    z: { type: Number },

    stars: { type: Number },
    asteroids: { type: Number },

    isHub: { type: Boolean, default: false },

    ownerId: { type: mongoose.Schema.ObjectId, ref: 'User' },

    visitedBy: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    scannedBy: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],

    galaxy: { type: mongoose.Schema.ObjectId, ref: 'Galaxy' },
    stellarObjects: [{ type: mongoose.Schema.ObjectId, ref: 'StellarObject' }],
    astronomicalObjects: [{ type: mongoose.Schema.ObjectId, ref: 'AstronomicalObject' }]
});

module.exports = mongoose.model("Sector", schema);