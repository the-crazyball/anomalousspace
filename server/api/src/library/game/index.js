'use strict'
const Chance = require('chance')
const chance = new Chance()
const seedrandom = require('seedrandom');
const { rndInt, rndDouble, selectByChance } = require('../helpers');

module.exports = class Game {
  constructor(client) {
    this.client = client;

    this.galaxy = {};

  }
  async init() {
    // create universe
    this.createGalaxy(74, 13);
  }
  createGalaxy(x, y) {

    seedrandom(`G${x}${y}`, { global: true });

    const colors = ['20941c', 'de1616', '1631de', 'dbdb1a']
    const types = ['Elliptical', 'Spiral', 'Lenticular', 'Irregular'];
    const typeNum = rndInt(0, types.length-1);

    this.galaxy.sectors = 10000000; //rndInt(1000, 100000); // each sector is 20 ly.
    this.galaxy.type = types[typeNum]
    this.galaxy.color = colors[typeNum];
    this.galaxy.name = `G${this.galaxy.type.charAt(0).toUpperCase()}${x}${y}`;

    //const stellarDensity = rndDouble(0.001, 0.2);
    //const numberOfStars = Math.ceil(Math.pow(10, 3) * stellarDensity); 
  }
  async deleteGuild(guild) {
    return await this.client.database.deleteGuild(guild);
  }
  async getGuild(guild) {
    return await this.client.database.findOrCreateGuild(guild, true);
  }
  async getUser(user, isLean) {
    return await this.client.database.findOrCreateUser(user, isLean);
  }
  async jumpTo(user, blueprint) {
    const userData = await this.getUser(user, false);
    
    const result = {};
    let fuelCost = 0;

    const x = userData.ship.position.x;
    const y = userData.ship.position.y;
    const z = userData.ship.position.z;

    const d = Math.abs(userData.ship.jumpEngine.class);

    // this is a check to make sure we aren't jumping to a sector outside our jump range
    let canJump = false;

    for (let q = -d; q <= d; q++) {
      for (let r = -d; r <= d; r++) {
          if (Math.abs(q + r) <= d) {
            const sectorX = x - q;
            const sectorY = y - r;

            if (sectorX === parseInt(blueprint.toCoord.x) && sectorY === parseInt(blueprint.toCoord.y))
              canJump = true;
          }
      }
    }

    if (canJump) {
      userData.ship.position.x = blueprint.toCoord.x;
      userData.ship.position.y = blueprint.toCoord.y;
      await userData.save();
      await userData.ship.save();
    }

    result.canJump = canJump;  
    result.fuelCost = fuelCost;

    return result;
  }
  async warpTo(user, blueprint) {
    const userData = await this.getUser(user, false);

    const x = userData.ship.position.x;
    const y = userData.ship.position.y;
    const z = userData.ship.position.z;

    userData.ship.position.x = blueprint.toCoord.x;
    userData.ship.position.y = blueprint.toCoord.y;
    await userData.save();
    await userData.ship.save();

    const result = {  
      cost: 'fuel cost'
    }
    return result;
  }
  async getMap(user, blueprint) {
    const userData = await this.getUser(user, true);

    const x = userData.ship.position.x;
    const y = userData.ship.position.y;
    const z = userData.ship.position.z;

    const d = Math.abs(blueprint.depth);

    const hexes = new Map();

    for (let q = -d; q <= d; q++) {
      for (let r = -d; r <= d; r++) {
          if (Math.abs(q + r) <= d) {

            const sectorX = x - q;
            const sectorY = y - r;
        
            seedrandom(`GS${sectorX}${sectorY}`, { global: true });

            let exists = (rndInt(0, 4) == 1);

            if(exists) {
              const types = [
                {
                  class: 'M', // star_red01
                  diameter: rndDouble(0.5, 0.7),
                  color: 'ff6343',
                  chance: 0.15
                },
                {
                  class: 'K', // star_red_giant01
                  diameter: rndDouble(0.7, 0.96),
                  color: 'ffa953',
                  chance: 0.20
                },
                {
                  class: 'G', // star_yellow01
                  diameter: rndDouble(0.96, 1.0),
                  color: 'fff663',
                  chance: 0.18
                },
                {
                  class: 'F', // star_white01
                  diameter: rndDouble(1.0, 1.2),
                  color: 'ffffff',
                  chance: 0.15
                },
                {
                  class: 'A', // star_white_giant01
                  diameter: rndDouble(1.2, 1.4),
                  color: 'cacdff',
                  chance: 0.10
                },
                {
                  class: 'B', // star_blue01
                  diameter: rndDouble(1.4, 1.6),
                  color: '8d95ff',
                  chance: 0.05
                },
                {
                  class: 'O', // star_blue_giant01
                  diameter: rndDouble(1.6, 1.8),
                  color: '646ffc',
                  chance: 0.02
                },
                {
                  class: 'BH', // blackhole
                  diameter: rndDouble(1.4, 1.8),
                  color: '000000',
                  chance: 0.05
                },
                {
                  class: 'AN', // anomaly
                  diameter: rndDouble(1, 1),
                  color: 'ff0000',
                  chance: 0.05
                },
                {
                  class: 'WH', // wormhole
                  diameter: rndDouble(1, 1),
                  color: 'ff00d9',
                  chance: 0.05
                }
              ]
              const systemType = selectByChance(types);
              hexes.set([q, r], { type: systemType, q: q, r: r });
            } else {
              hexes.set([q, r], { q: q, r: r })
            }
            
          }
      }
    }
    const list = []
    hexes.forEach((h) => {
      list.push(h)
    })
    const result = {  
      hexes: list
    }
    return result;
  }
  async scan(user, blueprint) {

    const userData = await this.getUser(user, true);

    const x = blueprint.coordinates.x || userData.ship.position.x;
    const y = blueprint.coordinates.y || userData.ship.position.y;
    const z = blueprint.coordinates.z || userData.ship.position.z;

    seedrandom(`GS${x}${y}`, { global: true });
    let exists = (rndInt(0, 4) == 1);
			if (!exists) return false;

			const stellarDensity = rndDouble(0.001, 0.001);
			const stars = Math.ceil(Math.pow(10, 3) * stellarDensity); 

			const types = [
				{
					class: 'M',
					diameter: rndDouble(0.1, 0.7),
					color: 'ff6343',
					chance: 0.15
				},
				{
					class: 'K',
					diameter: rndDouble(0.7, 0.96),
					color: 'ffa953',
					chance: 0.20
				},
				{
					class: 'G',
					diameter: rndDouble(0.96, 1.15),
					color: 'fff663',
					chance: 0.18
				},
				{
					class: 'F',
					diameter: rndDouble(1.15, 1.4),
					color: 'ffffff',
					chance: 0.15
				},
				{
					class: 'A',
					diameter: rndDouble(1.4, 1.8),
					color: 'cacdff',
					chance: 0.10
				},
				{
					class: 'B',
					diameter: rndDouble(1.8, 2.2),
					color: '8d95ff',
					chance: 0.05
				},
				{
					class: 'O',
					diameter: rndDouble(2.2, 3.0),
					color: '646ffc',
					chance: 0.02
				},
				{
					class: 'BH', // blackhole
					diameter: rndDouble(1.4, 1.8),
					color: '000000',
					chance: 0.05
				},
				{
					class: 'AN', // anomaly
					diameter: rndDouble(1, 1),
					color: 'ff0000',
					chance: 0.05
				},
				{
					class: 'WH', // wormhole
					diameter: rndDouble(1, 1),
					color: 'ff00d9',
					chance: 0.05
				}
			]
			//const diameter = rndInt(2, scale);
	
			// generate system astronomical objects

			const planets = [];

			let distanceFromStar = rndDouble(60.0, 200.0);
			const planetsCount = rndInt(0, 8);

			for (let i = 0; i < planetsCount; i++)
			{

        const objectTypes = [
          {
            object: 'planet',
            class: 'R',
            type: 'Rock',
            sizeMult: 1,
            populationMult: 0,
            resources: {

            },
            chance: 0.18 // very common
          },
          {
            object: 'planet',
            class: 'O',
            type: 'Ocean',
            sizeMult: 1,
            populationMult: -1,
            resources: {

            },
            chance: 0.14 // common
          },
          {
            object: 'planet',
            class: 'I',
            type: 'Ice',
            sizeMult: 1,
            populationMult: -1,
            resources: {

            },
            chance: 0.14 // common
          },
          {
            object: 'planet',
            class: 'G',
            type: 'Garden',
            sizeMult: 1,
            populationMult: 1,
            resources: {

            },
            chance: 0.05 // rare
          },
          {
            object: 'planet',
            class: 'GG',
            type: 'Gas Giant',
            sizeMult: 2,
            populationMult: 0,
            resources: {

            },
            chance: 0.14 // common
          },
          {
            object: 'planet',
            class: 'D',
            type: 'Desert',
            sizeMult: 1,
            populationMult: -2,
            resources: {

            },
            chance: 0.18 // very common
          },
          {
            object: 'asteroid',
            class: 'A',
            type: 'Asteroid',
            sizeMult: 1,
            populationMult: 0,
            resources: {

            },
            chance: 0.17 // very common
          },
        ]

        const object = selectByChance(objectTypes);

        object.distance = distanceFromStar;
        object.diameter = rndDouble(4.0, 20.0) * object.sizeMult;
        object.name = `${object.type}-` + Math.max(rndInt(500, 9999), 0);
        object.temperature = rndDouble(-200.0, 300.0);
        object.population = Math.max(rndInt(-5000000, 20000000), 0);
        object.ring = rndInt(0, 10) == 1;
        object.satellites = [];

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

			const systemType = selectByChance(types);

			const name = `GS${systemType.class}` + `${x}${y}`.padStart(this.galaxy.sectors.toString().length, '0');

      const result = {
        coordinates: { 
          x: x,
          y: y,
          z: 0
        },
				stars: stars,
				name: name,
				type: systemType,//types[rndInt(0, types.length-1)]
				planets: planets
			}
    //console.log(result)
    return result;
  }
  async warpStart(user) {
    const userData = await this.client.database.findOrCreateUser(user);
    if (!userData.ship) {
      const shipData = new this.client.database.shipModel();
      await shipData.save();
      userData.ship = shipData;
    }
    userData.populate('ship');
    await userData.save();

    return userData;
  }
  createGuild() {
    return new Promise(async (resolve, reject) => {
      const entry = await client.database.collection('guilds').findOne({ guid })
      if (entry) return reject('Guild exist in database.')
      await client.database.collection('guilds').insertOne({
        guid,
        settings: {
          restrictedChannel: undefined
        },
        createdAt: +new Date()
      })
        .then(resolve)
        .catch(e => reject('Error writing guild to the database.'))
    })
  }
}