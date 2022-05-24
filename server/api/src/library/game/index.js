'use strict'
const Chance = require('chance');
const chance = new Chance();
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

    const d = Math.abs(userData.ship.jumpDrive.class);

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
        userData.stats.discoveredSectors += 1;
        sector.visitedBy.push(userData._id);
        await sector.save();
      }

      userData.stats.jumps += 1;

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

    let outsideBounds = false;

    // check if outside of galaxy bounds
    if (blueprint.toCoord.x > userData.ship.galaxy.sectors && blueprint.toCoord.x >= 0) {
      outsideBounds = true;
    }
    if (blueprint.toCoord.x < -userData.ship.galaxy.sectors && blueprint.toCoord.x <= 0) {
      outsideBounds = true;
    }

    if (blueprint.toCoord.y > userData.ship.galaxy.sectors && blueprint.toCoord.y >= 0) {
      outsideBounds = true;
    }
    if (blueprint.toCoord.y < -userData.ship.galaxy.sectors && blueprint.toCoord.y <= 0) {
      outsideBounds = true;
    }

    if (!outsideBounds) {
      userData.ship.position.x = blueprint.toCoord.x;
      userData.ship.position.y = blueprint.toCoord.y;

      const sector = await this.client.database.findOrCreateSector({ galaxy: userData.ship.galaxy, sector: { x: blueprint.toCoord.x, y: blueprint.toCoord.y, z: 0 } });

      userData.ship.sector = sector;

      const visited = sector.visitedBy.find(id => id.toString() === userData._id.toString());
    
      if (!visited) {
        userData.stats.discoveredSectors += 1;
        sector.visitedBy.push(userData._id);
        sector.save();
      }

      userData.stats.warps += 1;

      await userData.save();
      await userData.ship.save();
    }

    const result = {
      outsideBounds
    }

    return result;
  }
  async getMap(user, blueprint) {
    const userData = await this.getUser(user, true);

    const x = userData.ship.position.x;
    const y = userData.ship.position.y;
    const z = userData.ship.position.z;

    const sectorsMax = userData.ship.galaxy.sectors;

    const d = Math.abs(blueprint.depth);

    const hexes = new Map();

    for (let q = -d; q <= d; q++) {
      for (let r = -d; r <= d; r++) {
          if (Math.abs(q + r) <= d) {

            const sectorX = x - q;
            const sectorY = y - r;

            let outsideBounds = false;

            // check of out of galaxy boundary sectors, should not be displayed.
            if (sectorX > sectorsMax && sectorsMax >= 0) {
              outsideBounds = true;
            }
            if (sectorX < -sectorsMax && sectorsMax <= 0) {
              outsideBounds = true;
            }
        
            if (sectorY > sectorsMax && sectorY >= 0) {
              outsideBounds = true;
            }
            if (sectorY < -sectorsMax && sectorY <= 0) {
              outsideBounds = true;
            }

            // check if player visited this sector before.
            const sector = await this.client.database.findSector({ galaxy: userData.ship.galaxy, sector: { x: sectorX, y: sectorY, z: 0 } });

            if(sector) {
              const visited = sector.visitedBy.find(id => id.toString() === userData._id.toString()) ? true : false;
              const scanned = sector.scannedBy.find(id => id.toString() === userData._id.toString()) ? true : false;
    
              if(sector.stellarObjects.length || sector.astronomicalObjects.length) {
                if (scanned) {
                  const systemType = {
                    class: sector.stellarObjects[0].class,
                    diameter: sector.stellarObjects[0].diameter,
                    color: sector.stellarObjects[0].color
                  }
                  
                  hexes.set([q, r], { type: systemType, q: q, r: r, visited: visited, scanned: scanned, outsideBounds });
                } else {
                  hexes.set([q, r], { q: q, r: r, visited: visited, scanned: scanned, outsideBounds })
                }
              } else {
                hexes.set([q, r], { q: q, r: r, visited: visited, scanned: scanned, outsideBounds })
              }
            } else {
              hexes.set([q, r], { q: q, r: r, visited: false, scanned: false, outsideBounds })
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
  async getCooldowns(user, blueprint) {
    const now = new Date().getTime();
    const cdMining = (5 * 60 * 1000); // 5 min

    let miningRemaining = 0;

    const userData = await this.getUser(user, false);

    if ((now - userData.ship.cooldowns.mining < cdMining) && userData.ship.cooldowns.mining > 0) {
      miningRemaining = cdMining - (now - userData.ship.cooldowns.mining);
    }

    return {
      miningRemaining
    }

  }
  async mine(user, blueprint) {
    const now = new Date().getTime();
    const cd = (5 * 60 * 1000); // 5 min

    let inCooldown = false;
    let cdRemaining = 0;
    let ignoreCooldown = false;
    let amountMined = 0;
    let hasAsteroids = true;

    const userData = await this.getUser(user, false);
    const ship = userData.ship;

    let asteroidsTotal = ship.sector.asteroids;

    if ((now - ship.cooldowns.mining < cd || ignoreCooldown) && ship.cooldowns.mining > 0) {
      inCooldown = true;
      cdRemaining = cd - (now - ship.cooldowns.mining);
    } else if (asteroidsTotal) {
      // determine the amount based on the mining laser level.
      // randomly generated
      amountMined = rndInt(5,15) * ship.miningLaser.level;

      // check if the item exists
      const cargoItem = ship.cargo.find(item => item.name === 'Asteroid Chunk' && item.type === 'asteroids');

      if (cargoItem) {
        cargoItem.quantity += amountMined;
      } else {
        ship.cargo.push({ name: 'Asteroid Chunk', type: 'asteroids', quantity: amountMined });
      }

      // add cooldown
      ship.cooldowns.mining = new Date().getTime();

      ship.sector.asteroids -= amountMined;
      asteroidsTotal -= amountMined;

      userData.stats.mining += 1;

      await ship.save();
      await ship.sector.save();
      await userData.save();
    } else {
      hasAsteroids = false;
    }

    return {
      inCooldown,
      cdRemaining,
      amountMined,
      hasAsteroids,
      asteroidsTotal
    }
  }
  async scan(user, blueprint) {

    const userData = await this.getUser(user, false);

    const x = blueprint.coordinates.x || userData.ship.position.x;
    const y = blueprint.coordinates.y || userData.ship.position.y;
    const z = blueprint.coordinates.z || userData.ship.position.z;

    // track scanned sectors
    const sector = await this.client.database.findOrCreateSector({ galaxy: userData.ship.galaxy, sector: { x, y, z } });
    const scanned = sector.scannedBy.find(id => id.toString() === userData._id.toString());
 
    if (!scanned) {
      userData.stats.scans += 1;
      await userData.save();
      sector.scannedBy.push(userData._id);
      await sector.save();
    }

    let result = false;

    // check if sector was discovered already, if not generate sector and store in the database
    if (!sector.name) {
      result = generateSector({ galaxy: userData.ship.galaxy, sector: { x, y, z } });

      sector.name = result.name;
      sector.stars = result.stars;
      sector.galaxy = userData.ship.galaxy;
      sector.asteroids = result.asteroids;

      if (result.stellarObjects) {
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
      }

      if (result.astronomicalObjects) {
        // create astronomical objects
        await Promise.all(result.astronomicalObjects.map(async (o) => {
          const astronomicalObject = await this.client.database.findOrCreateAstronomicalObject({ 
            galaxy: userData.ship.galaxy, 
            sector: sector,
            id: o.id
          });

          astronomicalObject.colonies = o.colonies;

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
      }

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