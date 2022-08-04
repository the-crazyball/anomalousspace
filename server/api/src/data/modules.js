module.exports = {
    'Weak Mining Laser': {
        name: 'Weak Mining Laser',
        description: 'A weak mining laser used for mining asteroids. These lasers can also be used for fighting with limited attack power.',
        size: 'tiny',
        sizeNum: 1,
        tier: 1,
        tierMax: 10,
        type: 'mining',
        icon: 'icon:mininglaser',

        powerConsumption: 1, // in kW/h
        powerProduction: 0, // in kW/h

        AP: 1, // mining lasers can attack, just not very efficiently

        cost: 1000,
        
        modifiers: {
            AP: 1,                  // * tier
            powerConsumption: 1,    // * tier
            cost: 1000              // * tier
        },

        upgradeCost: [
            {
                tierMin: 1,
                tierMax: 5,
                resources: [
                    { name: 'Asteroid Chunks', quantity: 60 } // tier * 100
                ]
            },
            {
                tierMin: 6,
                tierMax: 10,
                resources: [
                    { name: 'Asteroid Chunks', quantity: 60 }, // tier * 100
                    { name: 'Iron Ore', quantity: 60 }, // tier * 100
                ]
            }
        ],

        moduleSpace: 1
    },
    'Nuclear Powerplant': {
        name: 'Nuclear Powerplant',
        description: '',
        size: 'medium',
        sizeNum: 3,
        tier: 1,
        tierMax: 10,
        type: 'generator',
        icon: 'icon:generator',

        powerConsumption: 0, // in kW/h
        powerProduction: 20, // in kW/h

        cost: 1500,
        
        modifiers: {
            powerProduction: 20,    // * tier
            cost: 1500              // * tier
        },

        upgradeCost: [
            {
                tierMin: 1,
                tierMax: 10,
                resources: [
                    { name: 'Asteroid Chunks', quantity: 100 } // tier * 100
                ]
            }
        ],

        moduleSpace: 1
    },
    'RTG': {
        name: 'RTG',
        description: '',
        size: 'tiny',
        sizeNum: 1,
        tier: 1,
        tierMax: 10,
        type: 'generator',
        icon: 'icon:generator',

        powerConsumption: 0, // in kW/h
        powerProduction: 10, // in kW/h

        cost: 1000,
        
        modifiers: {
            powerProduction: 10,    // * tier
            cost: 1000              // * tier
        },

        upgradeCost: [
            {
                tierMin: 1,
                tierMax: 10,
                resources: [
                    { name: 'Asteroid Chunks', quantity: 60 } // tier * 100
                ]
            }
        ],

        moduleSpace: 1
    },
    'Solar Sails': {
        name: 'Solar Sails',
        description: '',
        size: 'small',
        sizeNum: 2,
        tier: 1,
        tierMax: 10,
        type: 'generator',
        icon: 'icon:generator',

        powerConsumption: 0, // in kW/h
        powerProduction: 15, // in kW/h

        cost: 1500,
        
        modifiers: {
            powerProduction: 15,    // * tier
            cost: 1500              // * tier
        },
        
        upgradeCost: [
            {
                tierMin: 1,
                tierMax: 10,
                resources: [
                    { name: 'Asteroid Chunks', quantity: 120 } // tier * 100
                ]
            }
        ],

        moduleSpace: 1
    },
    'Cargo Hold': {
        name: 'Cargo Hold',
        description: 'A cargo hold for all your mining and extra storage needs.',
        size: 'tiny',
        sizeNum: 1,
        tier: 1,
        tierMax: 10,
        type: 'cargo',
        icon: 'icon:cargohold',

        powerConsumption: 0, // in kW/h
        powerProduction: 0, // in kW/h

        cost: 200,
        
        modifiers: {
            cost: 200,
            cargoMax: 150
        },

        cargoMax: 200, // tier  + 100
        cargo: [],

        upgradeCost: [
            {
                tierMin: 1,
                tierMax: 10,
                resources: [
                    { name: 'Asteroid Chunks', quantity: 80 } // tier * 100
                ]
            }
        ],

        moduleSpace: 1
    },
    'Ion Thruster': {
        name: 'Ion Thruster',
        description: 'This engine will get you to point A to point B. It will also warp with limited range.',
        size: 'tiny',
        sizeNum: 1,
        tier: 1,
        tierMax: 10,
        type: 'engine',
        icon: 'icon:engine',

        powerConsumption: 10, // in kW/h
        powerProduction: 0, // in kW/h

        cost: 1000,
        
        modifiers: {
            cost: 1000,
            powerConsumption: 10
        },

        upgradeCost: [
            {
                tierMin: 1,
                tierMax: 10,
                resources: [
                    { name: 'Asteroid Chunks', quantity: 80 } // tier * 100
                ]
            }
        ],

        moduleSpace: 0
    },
    'Small Hangar Expansion': {
        name: 'Small Hangar Expansion',
        description: '',
        size: 'tiny',
        sizeNum: 1,
        tier: 1,
        tierMax: 5,
        type: 'hangar',
        icon: 'icon:hangar',

        powerConsumption: 0, // in kW/h
        powerProduction: 0, // in kW/h

        cost: 200,
        
        modifiers: {
            cost: 200,
            hangarMax: 10
        },
        
        hangarMax: 10,

        upgradeCost: [
            {
                tierMin: 1,
                tierMax: 5,
                resources: [
                    { name: 'Asteroid Chunks', quantity: 120 } // tier * 100
                ]
            }
        ],

        moduleSpace: 1
    },
};