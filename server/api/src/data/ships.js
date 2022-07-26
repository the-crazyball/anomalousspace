module.exports = {
    'Explorer': {
        size: 'small',
        sizeNum: 2, // used as modifier to calculate max module slots

        cost: 12000,

        hp: 120,
        hpIncrement: 15,

        tier: 1,

        cargo: [],

        engine: 'Ion thruster',

        modules: [
            'Weak Mining Laser',    // mining
            'RTG',                  // power
            'Cargo Hold'            // for cargo
        ]
    }
};