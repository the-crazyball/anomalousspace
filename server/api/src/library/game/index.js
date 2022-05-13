'use strict'
const Chance = require('chance')
const chance = new Chance()
const seedrandom = require('seedrandom');
const { rndInt, rndDouble, selectByChance } = require('../helpers');
const { generateSector } = require('./sectorFactory');

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
      sector.scannedBy.push(userData._id);
      await sector.save();
    }

    let result = false;

    // check if sector was discovered already, if not generate sector and store in the database
    if (!sector.galaxy && !sector.name) {
      result = generateSector({ galaxy: userData.ship.galaxy, sector: { x, y, z } });

      sector.name = result.name;
      sector.stars = result.stars;
      sector.galaxy = userData.ship.galaxy;

      // create stellar objects
      await Promise.all(result.stellarObjects.map(async (o) => {
        const stellarObject = await this.client.database.findOrCreateStellarObject({ 
          galaxy: userData.ship.galaxy, 
          sector: sector
        });

        stellarObject.objectId = o.id;
        stellarObject.type = o.type;
        stellarObject.class = o.class;
        stellarObject.diameter = o.diameter;
        stellarObject.color = o.color;

        sector.stellarObjects.push(stellarObject._id);

        await stellarObject.save();
      }));


      // create astronomical objects
      await Promise.all(result.astronomicalObjects.map(async (o) => {
        const astronomicalObject = await this.client.database.findOrCreateAstronomicalObject({ 
          galaxy: userData.ship.galaxy, 
          sector: sector,
          id: o.id
        });

        astronomicalObject.distance = o.distance;
        astronomicalObject.diameter = o.diameter;
        astronomicalObject.name = o.name;
        astronomicalObject.temperature = o.temperature;
        astronomicalObject.ring = o.ring;
        astronomicalObject.object = o.object;
        astronomicalObject.class = o.class;
        astronomicalObject.type = o.type;
        astronomicalObject.population = o.population;

        astronomicalObject.resources.thorium = o.resources.thorium;
        astronomicalObject.resources.plutonium = o.resources.plutonium;
        astronomicalObject.resources.uranium = o.resources.uranium;
        astronomicalObject.resources.rock = o.resources.rock;

        o.satellites.forEach(d => {
          astronomicalObject.satellites.push({ diameter: d });
        });

        sector.astronomicalObjects.push(astronomicalObject._id);

        await astronomicalObject.save();
      }));

      sector.populate(['stellarObjects', 'astronomicalObjects']);

      await sector.save();
    }

    return sector;
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