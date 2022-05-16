const seedrandom = require('seedrandom');
const { rndInt, rndDouble, selectByChance } = require('../helpers');

const generateSector = ({ galaxy, sector: { x, y, z} }) => {

    seedrandom(`GS-${galaxy.x}${galaxy.y}${galaxy.z}-${x}${y}${z}`, { global: true });

    let exists = (rndInt(0, 3) == 1);
		
    if (!exists) return false;

	const types = [
		{
        type: 'star',
			class: 'M',
			diameter: rndDouble(0.1, 0.7),
			color: 'ff6343',
			chance: 0.15
		},
		{
        type: 'star',
            class: 'K',
            diameter: rndDouble(0.7, 0.96),
            color: 'ffa953',
            chance: 0.20
		},
		{
        type: 'star',
			class: 'G',
			diameter: rndDouble(0.96, 1.15),
			color: 'fff663',
			chance: 0.18
		},
		{
        type: 'star',
			class: 'F',
			diameter: rndDouble(1.15, 1.4),
			color: 'ffffff',
			chance: 0.15
		},
		{
        type: 'star',
			class: 'A',
			diameter: rndDouble(1.4, 1.8),
			color: 'cacdff',
			chance: 0.10
		},
		{
        type: 'star',
			class: 'B',
			diameter: rndDouble(1.8, 2.2),
			color: '8d95ff',
			chance: 0.05
		},
		{
        type: 'star',
			class: 'O',
			diameter: rndDouble(2.2, 3.0),
			color: '646ffc',
			chance: 0.02
		},
		{
        type: 'blackhole',
			class: 'BH', // blackhole
			diameter: rndDouble(1.4, 1.8),
			color: '000000',
			chance: 0.05
		},
		{
        type: 'anomaly',
			class: 'AN', // anomaly
			diameter: rndDouble(1, 1),
			color: 'ff0000',
			chance: 0.05
		},
		{
        type: 'wormhole',
			class: 'WH', // wormhole
			diameter: rndDouble(1, 1),
			color: 'ff00d9',
			chance: 0.05
		}
	]
    const systemType = selectByChance(types);
      
    // determine how many stellar objects there are, for now only 1
    const stellarDensity = rndDouble(0.001, 0.001);
	const stars = Math.ceil(Math.pow(10, 3) * stellarDensity); 

	// generate system astronomical objects
	const planets = [];

	let distanceFromStar = rndDouble(60.0, 200.0);
	const planetsCount = rndInt(0, 8);

	for (let i = 0; i < planetsCount; i++) {
        const objectTypes = [
          {
            name: 'Rock',
            object: 'planet',
            class: 'R',
            type: 'planet:rock',
            sizeMult: 1,
            populationMult: 0,
            resources: {

            },
            chance: 0.22 // very common
          },
          {
            name: 'Ocean',
            object: 'planet',
            class: 'O',
            type: 'planet:ocean',
            sizeMult: 1,
            populationMult: -1,
            resources: {

            },
            chance: 0.16 // common
          },
          {
            name: 'Ice',
            object: 'planet',
            class: 'I',
            type: 'planet:ice',
            sizeMult: 1,
            populationMult: -1,
            resources: {

            },
            chance: 0.16 // common
          },
          {
            name: 'Garden',
            object: 'planet',
            class: 'G',
            type: 'planet:garden',
            sizeMult: 1,
            populationMult: 1,
            resources: {

            },
            chance: 0.05 // rare
          },
          {
            name: 'Gas-Giant',
            object: 'planet',
            class: 'GG',
            type: 'planet:gasgiant',
            sizeMult: 2,
            populationMult: 0,
            resources: {

            },
            chance: 0.19 // common
          },
          {
            name: 'Desert',
            object: 'planet',
            class: 'D',
            type: 'planet:desert',
            sizeMult: 1,
            populationMult: -2,
            resources: {

            },
            chance: 0.22 // very common
          }
        ]

        const object = selectByChance(objectTypes);

        object.distance = distanceFromStar;
        object.diameter = rndDouble(4.0, 20.0) * object.sizeMult;
        const objectId = Math.max(rndInt(500, 9999), 0);
        object.name = `${object.name}-${objectId}`;
        object.temperature = rndDouble(-200.0, 300.0);

        if (object.type === 'planet:garden') {
          object.population = Math.max(rndInt(-5000000, 20000000), 0);
        } else {
          object.population = 0;
        }

        object.colonies = 0;
        object.ring = rndInt(0, 10) == 1;
        object.satellites = [];  
        object.id = objectId;

			/*	const planet = {
					distance: distanceFromStar,
					diameter: rndDouble(4.0, 20.0),

          name: 'P-' + Math.max(rndInt(500, 9999), 0),

					// Could make temeprature a function of distance from star
					temperature: rndDouble(-200.0, 300.0),

					// Composition of planet
					foliage: 0,
					minerals: 0,
					gases: 0,
					water: 0,

					// Population could be a function of other habitat encouraging
					// properties, such as temperature and water
					population: Math.max(rndInt(-5000000, 20000000), 0),

					// 10% of planets have a ring
					ring: rndInt(0, 10) == 1,

					satellites: []
				}*/

				distanceFromStar += rndDouble(20.0, 200.0);

        object.resources.thorium = rndDouble(0.0, 1.0);
        object.resources.plutonium = rndDouble(0.0, 1.0);
        object.resources.uranium = rndDouble(0.0, 1.0);
        object.resources.rock = rndDouble(0.0, 1.0);

        const dSum = 1.0 / (object.resources.thorium + object.resources.plutonium + object.resources.uranium + object.resources.rock);
				object.resources.thorium *= dSum;
				object.resources.plutonium *= dSum;
				object.resources.uranium *= dSum;
				object.resources.rock *= dSum;

				/*planet.foliage = rndDouble(0.0, 1.0);
				planet.minerals = rndDouble(0.0, 1.0);
				planet.gases = rndDouble(0.0, 1.0);
				planet.water = rndDouble(0.0, 1.0);*/
				
				// Normalise to 100%
				/*const dSum = 1.0 / (planet.foliage + planet.minerals + planet.gases + planet.water);
				planet.foliage *= dSum;
				planet.minerals *= dSum;
				planet.gases *= dSum;
				planet.water *= dSum;*/

				// Satellites (Moons)
				const moonsCount = Math.max(rndInt(-5, 5), 0);

				for (let n = 0; n < moonsCount; n++)
				{
					// A moon is just a diameter for now, but it could be
					// whatever you want!
					object.satellites.push(rndDouble(1.0, 5.0));
				}
				
				// Add planet to vector
				planets.push(object);

	  }	

    const asteroids = Math.max(rndInt(-1000, 150000), 0);

    // sector name
    const name = `GS-${String.fromCharCode(65+Math.floor(Math.random() * 26))}-` + Math.max(rndInt(500, 9999), 0);

    const stellarObjectId = Math.max(rndInt(500, 9999), 0);

    const result = {
        coordinates: { 
          x: x,
          y: y,
          z: 0
        },

        stars: stars,
        name: name,
        asteroids: asteroids,

        stellarObjects: [{
            id: stellarObjectId,
            type: systemType.type,
            class: systemType.class,
            diameter: systemType.diameter,
            color: systemType.color
        }],
		    astronomicalObjects: planets
	}

    return result;
}

module.exports = { 
    generateSector
};