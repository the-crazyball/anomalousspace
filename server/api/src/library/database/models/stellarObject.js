const mongoose = require("mongoose");

// usually a sun, can be a wormhole or blackhole
const schema = mongoose.Schema({
    objectId: { type: Number },
    
    type: { type: String },

    class: { type: String },
    diameter: { type: Number },
    color: { type: String },

    userId: { type: mongoose.Schema.ObjectId, ref: 'User' },

    sector: { type: mongoose.Schema.ObjectId, ref: 'Sector' }
});

module.exports = mongoose.model("StellarObject", schema);