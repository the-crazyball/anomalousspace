const mongoose = require("mongoose");

const schema = mongoose.Schema({
    galaxy: { type: String },
    name: { type: String },

    x: { type: Number },
    y: { type: Number },
    z: { type: Number },

    ownerId: { type: mongoose.Schema.ObjectId, ref: 'User' },

    visitedBy: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    scannedBy: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],

    stellarObjects: [{ type: mongoose.Schema.ObjectId, ref: 'StellarObject' }]
});

module.exports = mongoose.model("Sector", schema);