const mongoose = require("mongoose");

// usually a sun, can be a wormhole or blackhole
const schema = mongoose.Schema({
    type: { type: String },

    class: { type: String },
    diameter: { type: Number },
    color: { type: String },

    userId: { type: mongoose.Schema.ObjectId, ref: 'User' }

});

module.exports = mongoose.model("AstronomicalObject", schema);