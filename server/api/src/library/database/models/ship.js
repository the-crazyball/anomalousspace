const mongoose = require("mongoose");

const schema = mongoose.Schema({
    name: { type: String, default: 'none' },
    class: { type: String, default: 'Explorer' },
    xp: { type: Number, default: 0 },
    level: { type: Number, default: 1 },

    galaxy: { type: String, default: 'GE7413' },
    sector: { 
        name: { type: String, default: 'GSG00005130' },
        x: { type: Number, default: 51 },
        y: { type: Number, default: 30 },
        z: { type: Number, default: 0 }
    },

    armor: {},
    shields: {},
    cargo: {},
    fuel: { type: Number }
});

module.exports = mongoose.model("Ship", schema);