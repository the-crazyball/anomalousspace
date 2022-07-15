const mongoose = require("mongoose");

// usually a sun, can be a wormhole or blackhole
const schema = mongoose.Schema({
    objectId: { type: Number },
    
    type: { type: String },

    class: { type: String },
    radius: { type: Number },
    mass: { type: Number },
    magnitude: { type: Number },
    color: { type: String },
    temperature: { type: Number },
    luminosity: { type: Number },
    hzInner: { type: Number },
    hzOuter: { type: Number },

    userId: { type: mongoose.Schema.ObjectId, ref: 'User' },

    sector: { type: mongoose.Schema.ObjectId, ref: 'Sector' }
});

module.exports = mongoose.model("StellarObject", schema);