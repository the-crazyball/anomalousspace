module.exports = {
    'Weak Mining Laser': {
        name: 'Weak Mining Laser',
        size: 'tiny',
        sizeNum: 1,
        tier: 1,
        tierMax: 10,
        type: 'mining',

        powerConsumption: 5, // in kW/h
        powerProduction: 0, // in kW/h

        AP: 1, // mining lasers can attack, just not very efficiently

        cost: 1000,
        
        upgradeCost: {
            'Asteroid Chunks': 100 // tier * 100
        },

        moduleSpace: 1
    },
    'Nuclear Powerplant': {
        name: 'Nuclear Powerplant',
        size: 'medium',
        sizeNum: 3,
        tier: 1,
        tierMax: 10,
        type: 'generator',

        powerConsumption: 0, // in kW/h
        powerProduction: 20, // in kW/h

        cost: 3000,
        
        upgradeCost: {
            'Asteroid Chunks': 400 // tier * 100
        },

        moduleSpace: 1
    },
    'RTG': {
        name: 'RTG',
        size: 'tiny',
        sizeNum: 1,
        tier: 1,
        tierMax: 10,
        type: 'generator',

        powerConsumption: 0, // in kW/h
        powerProduction: 10, // in kW/h

        cost: 1000,
        
        upgradeCost: {
            'Asteroid Chunks': 100 // tier * 100
        },

        moduleSpace: 1
    },
    'Solar Sails': {
        name: 'Solar Sails',
        size: 'small',
        sizeNum: 2,
        tier: 1,
        tierMax: 10,
        type: 'generator',

        powerConsumption: 0, // in kW/h
        powerProduction: 15, // in kW/h

        cost: 2000,
        
        upgradeCost: {
            'Asteroid Chunks': 200 // tier * 100
        },

        moduleSpace: 1
    },
    'Cargo Hold': {
        name: 'Cargo Hold',
        size: 'tiny',
        sizeNum: 1,
        tier: 1,
        tierMax: 10,
        type: 'misc',

        powerConsumption: 0, // in kW/h
        powerProduction: 0, // in kW/h

        cost: 200,
        
        upgradeCost: {
            'Asteroid Chunks': 200 // tier * 100
        },

        moduleSpace: 1
    },
    'Ion Thruster': {
        name: 'Ion Thruster',
        size: 'tiny',
        sizeNum: 1,
        tier: 1,
        tierMax: 10,
        type: 'engine',

        powerConsumption: 10, // in kW/h
        powerProduction: 0, // in kW/h

        cost: 1000,
        
        upgradeCost: {
            'Asteroid Chunks': 200 // tier * 100
        },

        moduleSpace: 0
    }
};