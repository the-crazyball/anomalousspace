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
    this.createUniverse();
    //this.createGalaxy(74, 13);
  }
  createUniverse() {
    seedrandom(`ANOMALOUSSPACE-01`, { global: true });
  }
  findRandomGalaxy() {
    const x = rndInt(-1000000, 1000000);
    const y = rndInt(-1000000, 1000000);

    seedrandom(`G${x}${y}`, { global: true });

    let exists = (rndInt(0, 4) == 1);
		if (!exists) return false;

    return {
      x,
      y
    }

  }
  async createGalaxy(x, y) {
    seedrandom(`G${x}${y}`, { global: true });

    const colors = ['20941c', 'de1616', '1631de', 'dbdb1a']
    const types = ['Elliptical', 'Spiral', 'Lenticular', 'Irregular'];
    const typeNum = rndInt(0, types.length-1);

    const galaxy = {};
    galaxy.sectors = rndInt(1000, 100000); // each sector is 20 ly.
    galaxy.type = types[typeNum]
    galaxy.color = colors[typeNum];
    galaxy.name = `G${galaxy.type.charAt(0).toUpperCase()}-${Math.max(rndInt(500, 9999), 0)}`;
    galaxy.x = x;
    galaxy.y = y;

    return await this.client.database.findOrCreateGalaxy(galaxy);

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

      const sector = await this.client.database.findOrCreateSector({ galaxy: userData.ship.galaxy, sector: { x: blueprint.toCoord.x, y: blueprint.toCoord.y, z: 0 } });

      const visited = sector.visitedBy.find(id => id.toString() === userData._id.toString());
   
      if (!visited) {
        sector.visitedBy.push(userData._id);
        sector.save();
      }

      userData.ship.sector = sector;
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

    if (blueprint.toGalaxy) {
      const galaxy = await this.client.database.findOrCreateGalaxy({ x: blueprint.toGalaxy.x, y: blueprint.toGalaxy.y });

      const visited = galaxy.visitedBy.find(id => id.toString() === userData._id.toString());
      if (!visited) {
        galaxy.visitedBy.push(userData._id);
        galaxy.save();
      }

      userData.ship.galaxy = galaxy;
    }

    userData.ship.position.x = blueprint.toCoord.x;
    userData.ship.position.y = blueprint.toCoord.y;

    const sector = await this.client.database.findOrCreateSector({ galaxy: userData.ship.galaxy, sector: { x: blueprint.toCoord.x, y: blueprint.toCoord.y, z: 0 } });

    userData.ship.sector = sector;

    const visited = sector.visitedBy.find(id => id.toString() === userData._id.toString());
   
    if (!visited) {
      sector.visitedBy.push(userData._id);
      sector.save();
    }

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

            // check if player visited this sector before.
            // TODO this is an issue, adds to many records to the database, should only read not write.
            const sector = await this.client.database.findOrCreateSector({ galaxy: userData.ship.galaxy, sector: { x: sectorX, y: sectorY, z: 0 } });


            const visited = sector.visitedBy.find(id => id.toString() === userData._id.toString()) ? true : false;
            const scanned = sector.scannedBy.find(id => id.toString() === userData._id.toString()) ? true : false;

            seedrandom(`GS${sectorX}${sectorY}`, { global: true });

            let exists = (rndInt(0, 4) == 1);

            if(exists) {
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
             
              const systemType = selectByChance(types);

              hexes.set([q, r], { type: systemType, q: q, r: r, visited: visited, scanned: scanned });
            } else {
              hexes.set([q, r], { q: q, r: r, visited: visited, scanned: scanned })
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

    // track scanned sectors
    const sector = await this.client.database.findOrCreateSector({ galaxy: userData.ship.galaxy, sector: { x, y, z } });
    const scanned = sector.scannedBy.find(id => id.toString() === userData._id.toString());
   
    if (!scanned) {
      sector.galaxy = userData.ship.galaxy;
      sector.scannedBy.push(userData._id);
      await sector.save();
    }

    seedrandom(`GS${x}${y}`, { global: true });

    let exists = (rndInt(0, 4) == 1);
		
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

      // store stellar objects
      //const stellarObject = await this.client.database.findOrCreateStellarObject({ 
      //  galaxy: userData.ship.galaxy, 
      //  sector: sector, 
      //  data: systemType 
      //});

			// generate system astronomical objects
			const planets = [];

			let distanceFromStar = rndDouble(60.0, 200.0);
			const planetsCount = rndInt(0, 8);

			for (let i = 0; i < planetsCount; i++)
			{
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
            chance: 0.14 // common
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
            chance: 0.14 // common
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
            name: 'Gas Giant',
            object: 'planet',
            class: 'GG',
            type: 'planet:gasgiant',
            sizeMult: 2,
            populationMult: 0,
            resources: {

            },
            chance: 0.14 // common
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
            name: 'Asteroid',
            object: 'asteroid',
            class: 'A',
            type: 'object:asteroid',
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
        const objectId = Math.max(rndInt(500, 9999), 0);
        object.name = `${object.name}-${objectId}`;
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
				
        // store astronomical objects
        /*const astronomicalObject = await this.client.database.findOrCreateAstronomicalObject({ 
          galaxy: userData.ship.galaxy, 
          sector: sector,
          stellarObject,
          id: objectId
        });

        astronomicalObject.distance = object.distance;
        astronomicalObject.diameter = object.diameter;
        astronomicalObject.name = object.name;
        astronomicalObject.temperature = object.temperature;
        astronomicalObject.ring = object.ring;*/

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

       // await astronomicalObject.save();
			}	

      // sector name
      const name = `GS-${String.fromCharCode(65+Math.floor(Math.random() * 26))}-` + Math.max(rndInt(500, 9999), 0);
      sector.name = name;
      //sector.stellarObjects.push(stellarObject);
      await sector.save();

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

    // create or get an existing galaxy to warp in
    let randomGalaxy = false
    do {
      randomGalaxy = this.findRandomGalaxy();
    } while (!randomGalaxy);

    const galaxy = await this.createGalaxy(randomGalaxy.x, randomGalaxy.y);

    // TODO check for planets and neighboring players
    const x = rndInt(-Math.abs(galaxy.sectors), galaxy.sectors);
    const y = rndInt(-Math.abs(galaxy.sectors), galaxy.sectors);
    const z = 0;

    await this.warpTo(user, {
      toGalaxy: {
        x: galaxy.x,
        y: galaxy.y
      },
      toCoord: {
        x: x,
        y: y,
        z: z
      }
    })
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