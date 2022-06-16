const mongoose = require("mongoose");

const schema = mongoose.Schema({
    name: { type: String },
    sectors: { type: Number },
    type: { type: String },
    color: { type: String },

    hubs: [],
    size: { type: Number },

    x: { type: Number },
    y: { type: Number },
    z: { type: Number, default: 0 },

    visitedBy: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],

});

module.exports = mongoose.model("Galaxy", schema);