const seedrandom = require('seedrandom');
const { rndInt, rndDouble, selectByChance } = require('../helpers');

const generateSector = ({ galaxy, sector: { x, y, z, isHub } }) => {

    seedrandom(`GS-${galaxy.x}${galaxy.y}${galaxy.z}-${x}${y}${z}`, { global: true });

    let exists = (rndInt(0, 3) == 1);
		
    if (isHub) {
      exists = true;
    }

    if (!exists) return false;

	  const types = [
		{
      type: 'star',
			class: 'M',
      radius: rndDouble(0.1, 0.7),
      mass: rndDouble(0.06, 0.51),
      magnitude: rndDouble(8.8, 16.0),
			color: 'ff6343',
			chance: 0.15,
      temperature: rndInt(2000, 3500),
      luminosity: rndDouble(0.00000110, 0.081),
      hzInner: rndDouble(0.0, 0.25), // in AU
      hzOuter: rndDouble(0.0, 0.40) // in AU
		},
		{
      type: 'star',
      class: 'K',
      radius: rndDouble(0.7, 0.96),
      mass: rndDouble(0.67, 0.79),
      magnitude: rndDouble(5.9, 7.4),
      color: 'ffa953',
      chance: 0.20,
      temperature: rndInt(3501, 4900),
      luminosity: rndDouble(0.082, 0.50),
      hzInner: rndDouble(0.27, 0.55), // in AU
      hzOuter: rndDouble(0.43, 0.87) // in AU
		},
		{
      type: 'star',
			class: 'G',
			radius: rndDouble(0.96, 1.15),
      mass: rndDouble(0.92, 1.05),
      magnitude: rndDouble(4.4, 5.1),
			color: 'fff663',
			chance: 0.18,
      temperature: rndInt(4901, 6000),
      luminosity: rndDouble(0.51, 1.45),
      hzInner: rndDouble(0.70, 1.10), // in AU
      hzOuter: rndDouble(1.12, 1.75) // in AU
		},
		{
      type: 'star',
			class: 'F',
			radius: rndDouble(1.15, 1.4),
      mass: rndDouble(1.4, 1.6),
      magnitude: rndDouble(2.7, 3.1),
			color: 'ffffff',
			chance: 0.15,
      temperature: rndInt(6001, 7400),
      luminosity: rndDouble(1.46, 6.50),
      hzInner: rndDouble(1.31, 2.37), // in AU
      hzOuter: rndDouble(2.08, 3.79) // in AU
		},
		{
      type: 'star',
			class: 'A',
			radius: rndDouble(1.4, 1.8),
      mass: rndDouble(2.0, 2.9),
      magnitude: rndDouble(0.6, 1.1),
			color: 'cacdff',
			chance: 0.10,
      temperature: rndInt(7401, 9900),
      luminosity: rndDouble(6.51, 50.0),
      hzInner: rndDouble(2.72, 6.21), // in AU
      hzOuter: rndDouble(4.34, 9.92) // in AU
		},
		{
      type: 'star',
			class: 'B',
			radius: rndDouble(1.8, 2.2),
      mass: rndDouble(5.9, 17.5),
      magnitude: rndDouble(-1.2, -4.0),
			color: '8d95ff',
			chance: 0.05,
      temperature: rndInt(9901, 28000),
      luminosity: rndDouble(51, 3020),
      hzInner: rndDouble(7.48, 51.66), // in AU
      hzOuter: rndDouble(11.93, 82.43) // in AU
		},
		{
      type: 'star',
			class: 'O',
			radius: rndDouble(2.2, 3.0),
      mass: rndDouble(60.0, 120.3),
      magnitude: rndDouble(-4.9, -5.7),
			color: '646ffc',
			chance: 0.02,
      temperature: rndInt(28000, 50000),
      luminosity: rndDouble(4820, 17500),
      hzInner: rndDouble(65.26, 124.35), // in AU
      hzOuter: rndDouble(104.14, 198.43) // in AU
		},
		{
      type: 'blackhole',
			class: 'BH', // blackhole
			radius: rndDouble(1.4, 1.8),
      mass: 0,
      magnitude: 0,
			color: '000000',
			chance: 0.05,
      temperature: 0,
      luminosity: 0,
      hzInner: 0, // in AU
      hzOuter: 0 // in AU
		},
		{
      type: 'anomaly',
			class: 'AN', // anomaly
			radius: rndDouble(1, 1),
      mass: 0,
      magnitude: 0,
			color: 'ff0000',
			chance: 0.05,
      temperature: 0,
      luminosity: 0,
      hzInner: 0, // in AU
      hzOuter: 0 // in AU
		},
		{
      type: 'wormhole',
			class: 'WH', // wormhole
			radius: rndDouble(1, 1),
      mass: 0,
      magnitude: 0,
			color: 'ff00d9',
			chance: 0.05,
      temperature: 0,
      luminosity: 0,
      hzInner: 0, // in AU
      hzOuter: 0 // in AU
		}
	]
  let systemType = selectByChance(types);
     
  if (isHub) {
    systemType = types[2];
  }

  // determine how many stellar objects there are, for now only 1
  const stellarDensity = rndDouble(0.001, 0.001);
	const stars = Math.ceil(Math.pow(10, 3) * stellarDensity); 

	const planetsCount = isHub ? rndInt(1, 6) : rndInt(1, 10);
  let planets = generatePlanets(planetsCount);

  // this is to make sure there is a garden planet for the hub sector/station.
  // otherwise why would there be a hub in un-inhabited sector....
  if (isHub) {
    do {
      planets = generatePlanets(planetsCount);
    } while (!planets.find(p => p.type === 'planet:garden'));
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
            radius: systemType.radius,
            mass: systemType.mass,
            color: systemType.color,
            temperature: systemType.temperature,
            luminosity: systemType.luminosity,
            hzInner: systemType.hzInner,
            hzOuter: systemType.hzOuter,
        }],
		    astronomicalObjects: planets
	}

    return result;
}

const generatePlanets = (count) => {
  const planets = [];

  // distance is a calculated as AU, this will be used for the HZ in the system.
  // 1 AU = 149597870.7 KM = 0.00001582333789085 LY = 0.000004848136776084 Parsec
  let distanceFromStar = rndDouble(20.0, 200.0);
  let asteroidBeltCount = 0;

  for (let i = 0; i < count; i++) {
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
        chance: 0.18 // very common
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
        chance: 0.12 // common
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
        chance: 0.12 // common
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
        chance: 0.15 // common
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
        chance: 0.18 // very common
      },
      {
        name: 'Asteroid Belt',
        object: 'asteroidbelt',
        class: 'X',
        type: 'asteroid:belt',
        resources: {},
        chance: 0.20 // very common
      }
    ]

    let object = selectByChance(objectTypes);

    if (object.object === 'asteroidbelt'){
      if (asteroidBeltCount < 4) {
        object.asteroidsNum = Math.max(rndInt(200, 5000), 0);
        asteroidBeltCount++;
      } else {
        do {
          object = selectByChance(objectTypes);
        } while (object.object !== 'asteroidbelt');
      }
    }

    if (object.object === 'planet') {
      object.diameter = rndDouble(4.0, 20.0) * object.sizeMult;
      object.temperature = rndDouble(-200.0, 300.0);

      if (object.type === 'planet:garden') {
        object.population = Math.max(rndInt(-5000000, 20000000), 0);
      } else {
        object.population = 0;
      }

      object.colony = [];
      object.ring = rndInt(0, 10) == 1;
      object.satellites = [];  
      
      object.resources.thorium = rndDouble(0.0, 1.0);
      object.resources.plutonium = rndDouble(0.0, 1.0);
      object.resources.uranium = rndDouble(0.0, 1.0);
      object.resources.rock = rndDouble(0.0, 1.0);

      const dSum = 1.0 / (object.resources.thorium + object.resources.plutonium + object.resources.uranium + object.resources.rock);
      object.resources.thorium *= dSum;
      object.resources.plutonium *= dSum;
      object.resources.uranium *= dSum;
      object.resources.rock *= dSum;

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
    }

    const objectId = Math.max(rndInt(500, 9999), 0);

    object.distance = distanceFromStar * 1000000; // in KM
    
    distanceFromStar += rndDouble(20.0, 200.0) * 1000000; // in KM

    object.id = objectId;
    object.name = `${object.name}-${objectId}`;

    // Add planet to sector
		planets.push(object);
  }

  return planets;
}

module.exports = { 
    generateSector
};