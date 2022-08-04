module.exports = {
    'Explorer': {
        size: 'small',
        sizeNum: 2, // used as modifier to calculate max module slots

        cost: 12000,

        hp: 120,
        hpIncrement: 15,

        armor: 3,

        tier: 1,
        tierMax: 10,

        hangarMax: 5,
        hangar: [],

        modules: [
            'Weak Mining Laser',    // mining
            'RTG',                  // power
            'Cargo Hold',           // for cargo
            'Ion Thruster'          // engine (no module space)
        ]
    }
};