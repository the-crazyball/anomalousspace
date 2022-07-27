'use strict'
const Chance = require('chance');
const chance = new Chance();
const seedrandom = require('seedrandom');
const { rndInt, rndDouble, selectByChance } = require('../helpers');
const { generateSector } = require('./sectorFactory');
const ships = require('../../data/ships');
const modules = require('../../data/modules');
const resources = require('../../data/resources');
const common = require('../common');
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
        seedrandom(`ANOMALOUSSPACE-03`, {
            global: true
        });
    }
    findRandomGalaxy() {
        const x = rndInt(-1000000, 1000000);
        const y = rndInt(-1000000, 1000000);

        seedrandom(`G${x}${y}`, {
            global: true
        });

        let exists = (rndInt(0, 4) == 1);
        if (!exists) return false;

        return {
            x,
            y
        }

    }
    async createGalaxy(x, y) {
        seedrandom(`G${x}${y}`, {
            global: true
        });

        const colors = ['20941c', 'de1616', '1631de', 'dbdb1a']
        const types = ['Elliptical', 'Spiral', 'Lenticular', 'Irregular'];
        const size = rndInt(1, 100);
        const typeNum = rndInt(0, types.length - 1);

        const galaxy = {};
        galaxy.sectors = rndInt((size * 1000) - 200, (size * 1000) + 200); // each sector is 20 ly.
        galaxy.type = types[typeNum]
        galaxy.color = colors[typeNum];
        galaxy.name = `G${galaxy.type.charAt(0).toUpperCase()}-${Math.max(rndInt(500, 9999), 0)}`;
        galaxy.x = x;
        galaxy.y = y;

        // determine how many ancient cities, and ancient teleports a galaxy has.
        // also determine how many links the teleports has - to other galaxies/sectors with ancient teleports
        const hubCount = size * 8;
        let points = [];

        for (let i = 0; i < hubCount; i++) {
            const x = rndInt(-Math.abs(galaxy.sectors), galaxy.sectors);
            const y = rndInt(-Math.abs(galaxy.sectors), galaxy.sectors);
            points.push({
                x,
                y
            });
        }

        galaxy.size = size;
        galaxy.hubs = points;

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
    async getUser(msg) {
        let isLean = false;

        if (msg.hasOwnProperty('data')) {
            isLean = msg.data.isLean;
        } 

        return await this.client.database.findOrCreateUser(msg.user, isLean);
    }
    async jumpTo(msg) {
        const userData = await this.getUser({
            user: msg.user,
            data: {
                isLean: false
            }
        });
        const toCoord = msg.data.toCoord;

        const result = {};
        let fuelCost = 0;

        const x = userData.ship.position.x;
        const y = userData.ship.position.y;
        const z = userData.ship.position.z;

        //const engine = userData.ship.modules.find(m => m.type === 'engine');
        //const d = Math.abs(engine.tier);
        const d = 1; // TODO hardcoded for now, since the jump map any bigger than 1-2 gets tiny and unreadable.

        // this is a check to make sure we aren't jumping to a sector outside our jump range
        let canJump = false;

        for (let q = -d; q <= d; q++) {
            for (let r = -d; r <= d; r++) {
                if (Math.abs(q + r) <= d) {
                    const sectorX = x - q;
                    const sectorY = y - r;

                    if (sectorX === parseInt(toCoord.x) && sectorY === parseInt(toCoord.y))
                        canJump = true;
                }
            }
        }

        if (canJump) {
            userData.ship.position.x = toCoord.x;
            userData.ship.position.y = toCoord.y;

            const sector = await this.client.database.findOrCreateSector({
                galaxy: userData.ship.galaxy,
                sector: {
                    x: toCoord.x,
                    y: toCoord.y,
                    z: 0
                }
            });
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
    async warpTo(msg) {
        const userData = await this.getUser({
            user: msg.user,
            data: {
                isLean: false
            }
        });
        const { toCoord, toGalaxy } = msg.data;

        const x = userData.ship.position.x;
        const y = userData.ship.position.y;
        const z = userData.ship.position.z;

        if (toGalaxy) {
            const galaxy = await this.client.database.findOrCreateGalaxy({
                x: toGalaxy.x,
                y: toGalaxy.y
            });

            const visited = galaxy.visitedBy.find(id => id.toString() === userData._id.toString());
            if (!visited) {
                galaxy.visitedBy.push(userData._id);
                galaxy.save();
            }

            userData.ship.galaxy = galaxy;
        }

        let outsideBounds = false;

        // check if outside of galaxy bounds
        if (toCoord.x > userData.ship.galaxy.sectors && toCoord.x >= 0) {
            outsideBounds = true;
        }
        if (toCoord.x < -userData.ship.galaxy.sectors && toCoord.x <= 0) {
            outsideBounds = true;
        }

        if (toCoord.y > userData.ship.galaxy.sectors && toCoord.y >= 0) {
            outsideBounds = true;
        }
        if (toCoord.y < -userData.ship.galaxy.sectors && toCoord.y <= 0) {
            outsideBounds = true;
        }

        if (!outsideBounds) {
            userData.ship.position.x = toCoord.x;
            userData.ship.position.y = toCoord.y;

            const sector = await this.client.database.findOrCreateSector({
                galaxy: userData.ship.galaxy,
                sector: {
                    x: toCoord.x,
                    y: toCoord.y,
                    z: 0
                }
            });

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
    async getMap(msg) {
        const userData = await this.getUser({
            user: msg.user,
            data: {
                isLean: true
            }
        });
        const { depth } = msg.data;

        const x = userData.ship.position.x;
        const y = userData.ship.position.y;
        const z = userData.ship.position.z;

        const sectorsMax = userData.ship.galaxy.sectors;

        const d = Math.abs(depth);

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
                    const sector = await this.client.database.findSector({
                        galaxy: userData.ship.galaxy,
                        sector: {
                            x: sectorX,
                            y: sectorY,
                            z: 0
                        }
                    });

                    if (sector) {
                        const visited = sector.visitedBy.find(id => id.toString() === userData._id.toString()) ? true : false;
                        const scanned = sector.scannedBy.find(id => id.toString() === userData._id.toString()) ? true : false;

                        if (sector.stellarObjects.length || sector.astronomicalObjects.length) {
                            if (scanned) {
                                const systemType = {
                                    class: sector.stellarObjects[0].class,
                                    radius: sector.stellarObjects[0].radius,
                                    color: sector.stellarObjects[0].color
                                }

                                hexes.set([q, r], {
                                    type: systemType,
                                    q: q,
                                    r: r,
                                    visited: visited,
                                    scanned: scanned,
                                    outsideBounds,
                                    isHub: sector.isHub
                                });
                            } else {
                                hexes.set([q, r], {
                                    q: q,
                                    r: r,
                                    visited: visited,
                                    scanned: scanned,
                                    outsideBounds,
                                    isHub: sector.isHub
                                })
                            }
                        } else {
                            hexes.set([q, r], {
                                q: q,
                                r: r,
                                visited: visited,
                                scanned: scanned,
                                outsideBounds,
                                isHub: sector.isHub
                            })
                        }
                    } else {
                        hexes.set([q, r], {
                            q: q,
                            r: r,
                            visited: false,
                            scanned: false,
                            outsideBounds
                        })
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
    async getCooldowns(msg) {
        const now = new Date().getTime();
        const cdMining = (5 * 60 * 1000); // 5 min

        let miningRemaining = 0;

        const userData = await this.getUser({
            user: msg.user,
            data: {
                isLean: false
            }
        });

        if ((now - userData.ship.cooldowns.mining < cdMining) && userData.ship.cooldowns.mining > 0) {
            miningRemaining = cdMining - (now - userData.ship.cooldowns.mining);
        }

        return {
            miningRemaining
        }

    }
    async getSector(msg) {
        const userData = await this.getUser({
            user: msg.user,
            data: {
                isLean: false
            }
        });

        const x = userData.ship.position.x;
        const y = userData.ship.position.y;
        const z = userData.ship.position.z;

        // track scanned sectors
        const sector = await this.client.database.findOrCreateSector({
            galaxy: userData.ship.galaxy,
            sector: {
                x,
                y,
                z
            }
        });
        const scanned = sector.scannedBy.find(id => id.toString() === userData._id.toString());

        return {
            sector,
            scanned: scanned ? true : false
        }

    }
    async getLeaderboard(msg) {
        const userData = await this.getUser({
            user: msg.user,
            data: {
                isLean: false
            }
        });

        const filter = msg.data.filter;

        const allUsers = await this.client.database.getUsers();

        allUsers.sort((a, b) => b.stats[filter] - a.stats[filter]);

        const lb = [];

        allUsers.forEach(u => {
            lb.push({
                name: u.discordUsername,
                value: u.stats[filter],
                me: u.discordId === userData.discordId ? true : false
            })
        })
        return lb;
    }
    async getColonies(msg) {
        const userData = await this.getUser({
            user: msg.user,
            data: {
                isLean: false
            }
        });

        const colonies = await this.client.database.getColonies(userData);

        return colonies;
    }
    async colonizeGetObjects(msg) {
        const userData = await this.getUser({
            user: msg.user,
            data: {
                isLean: false
            }
        });
        const objects = userData.ship.sector.astronomicalObjects.filter(o => !o.ownedBy && o.type !== 'asteroid:belt');

        return objects;
    }
    async colonize(msg) {

        const userData = await this.getUser({
            user: msg.user,
            data: {
                isLean: false
            }
        });

        const x = userData.ship.position.x;
        const y = userData.ship.position.y;
        const z = userData.ship.position.z;

        // note to self, call cached sector and not the userData sector when edits are needed. doh!
        const sector = await this.client.database.findOrCreateSector({
            galaxy: userData.ship.galaxy,
            sector: {
                x,
                y,
                z
            }
        });
        const object = sector.astronomicalObjects.find(o => o.name == msg.data.selectedObject);

        let colonized = false;
        let expansion = false;
        let message = '';

        if (object) {
            if (!object.ownedBy) {
                // check if we have enough resources for first colony
                // asteroid chucks needed for first colony, set to 200 for now.
                const chunks = userData.ship.cargo.find(item => item.name === 'Asteroid Chunks' && item.type === 'asteroid');
 
                if (chunks.quantity >= 60) {
                    colonized = true;
                    userData.stats.colony_founded += 1
                    chunks.quantity -= 60;
                    await chunks.save();
                    await userData.ship.save();
                } else {
                    message = `Not enough resources to create a colony.\n\n**Resources Needed**\n\`60\` x \`Asteroid Chunks\``;
                }
            } else if (object.ownedBy._id.toString() == userData._id.toString()) {
                colonized = true
                expansion = true
            }
        }
        if (colonized) {
            userData.stats.colonies += 1;
            
            object.colony.push({
                population: 0,
                tier: 0
            }) // Tier 0 means just about founded, nothing more. Tier >0 should start adding significant population
            object.ownedBy = userData._id;
            await object.save();
            await userData.save();
            await object.populate({
                path: 'ownedBy',
                select: 'discordUsername rank'
            });
        }
        return {
            colonized,
            expansion,
            message
        }
    }
    async mine(msg) {
        const now = new Date().getTime();
        const cd = (5 * 60 * 1000); // 5 min

        let inCooldown = false;
        let cdRemaining = 0;
        let ignoreCooldown = false;
        let amountMined = 0;
        let hasAsteroids = true;

        const userData = await this.getUser({
            user: msg.user,
            data: {
                isLean: false
            }
        });
        const ship = userData.ship;
        
        const x = userData.ship.position.x;
        const y = userData.ship.position.y;
        const z = userData.ship.position.z;

        // TODO this is also in the colonize method, perhaps there's a simpler way?
        // note to self, call cached sector and not the userData sector when edits are needed. doh!
        const sector = await this.client.database.findOrCreateSector({
            galaxy: userData.ship.galaxy,
            sector: {
                x,
                y,
                z
            }
        });

        const astronomicalObjects = sector.astronomicalObjects;

        // now we need to calculate the total asteroids.
        const asteroidBelts = astronomicalObjects.filter(o => o.type === 'asteroid:belt');

        let asteroidsTotal = 0;

        if (asteroidBelts) {
            asteroidBelts.forEach(b => {
                asteroidsTotal += b.asteroidsNum;
            });
        }

        if ((now - ship.cooldowns.mining < cd || ignoreCooldown) && ship.cooldowns.mining > 0) {
            inCooldown = true;
            cdRemaining = cd - (now - ship.cooldowns.mining);
        } else if (asteroidsTotal) {
            // get mining module
            const miningModule = ship.modules.find(m => m.type === 'mining');
            // determine the amount based on the mining laser level.
            // randomly generated
            amountMined = rndInt(5, 15) * miningModule.tier;

            if (amountMined > asteroidsTotal) {
                amountMined = asteroidsTotal;
            }

            // check if the item exists
            const cargoItem = ship.cargo.find(item => item.name === 'Asteroid Chunks' && item.type === 'asteroid');

            if (cargoItem) {
                cargoItem.quantity += amountMined;
            } else {
                ship.cargo.push({
                    name: 'Asteroid Chunks',
                    type: 'asteroid',
                    quantity: amountMined
                });
            }

            // add cooldown
            ship.cooldowns.mining = new Date().getTime();

            // deduct the amount of mined asteroids from the asteroid belts
            let remainingAmount = amountMined;

            asteroidBelts.forEach(b => {
                if (remainingAmount) {
                    if (b.asteroidsNum) { // must not be 0
                        b.asteroidsNum -= amountMined;
                        if (b.asteroidsNum < 0) {
                            remainingAmount = +b.asteroidsNum; // left amount to deduct from other belt.
                            b.asteroidsNum = 0
                        } else {
                            remainingAmount = 0;
                        }
                        b.save();
                    }
                }
            });

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
    async scan(msg) {

        const userData = await this.getUser({
            user: msg.user,
            data: {
                isLean: false
            }
        });
        const { type, coordinates } = msg.data; // TODO type is not used

        const x = coordinates.x || userData.ship.position.x;
        const y = coordinates.y || userData.ship.position.y;
        const z = coordinates.z || userData.ship.position.z;

        // track scanned sectors
        const sector = await this.client.database.findOrCreateSector({
            galaxy: userData.ship.galaxy,
            sector: {
                x,
                y,
                z
            }
        });
        const scanned = sector.scannedBy.find(id => id.toString() === userData._id.toString());

        if (!scanned) {
            userData.stats.scans += 1;
            await userData.save();
            sector.scannedBy.push(userData._id);

            // check if this sector is a hub
            const hub = userData.ship.galaxy.hubs.find(h => h.x === x && h.y === y);
            if (hub) {
                sector.isHub = true;
            }

            await sector.save();
        }

        let result = false;

        // check if sector was discovered already, if not generate sector and store in the database
        if (!sector.name) {
            result = generateSector({
                galaxy: userData.ship.galaxy,
                sector: {
                    x,
                    y,
                    z,
                    isHub: sector.isHub
                }
            });

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
                    stellarObject.radius = o.radius;
                    stellarObject.mass = o.mass;
                    stellarObject.magnitude = o.magnitude;
                    stellarObject.color = o.color;
                    stellarObject.temperature = o.temperature;
                    stellarObject.luminosity = o.luminosity;
                    stellarObject.hzInner = o.hzInner;
                    stellarObject.hzOuter = o.hzOuter;

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
                        objectId: o.id
                    });

                    if (o.object === 'asteroidbelt') {
                        astronomicalObject.asteroidsNum = o.asteroidsNum;
                    }

                    if (o.object === 'planet') {
                        astronomicalObject.colony = o.colony;
                        astronomicalObject.diameter = o.diameter;
                        astronomicalObject.temperature = o.temperature;
                        astronomicalObject.ring = o.ring;
                        astronomicalObject.object = o.object;
                        astronomicalObject.class = o.class;
                        astronomicalObject.population = o.population;
                        astronomicalObject.isHub = o.isHub;

                        astronomicalObject.resources.thorium = o.resources.thorium;
                        astronomicalObject.resources.plutonium = o.resources.plutonium;
                        astronomicalObject.resources.uranium = o.resources.uranium;
                        astronomicalObject.resources.rock = o.resources.rock;

                        o.satellites.forEach(d => {
                            astronomicalObject.satellites.push({
                                diameter: d
                            });
                        });
                    }

                    astronomicalObject.name = o.name;
                    astronomicalObject.type = o.type;
                    astronomicalObject.distance = o.distance;

                    sector.astronomicalObjects.push(astronomicalObject._id);

                    await astronomicalObject.save();
                }));
            }

            sector.populate(['stellarObjects', 'astronomicalObjects']);

            await sector.save();
        }

        return sector;
    }
    async warpStart(msg) {
        const userData = await this.client.database.findOrCreateUser(msg.user);

        if (!userData.ship) {
            // 'Explore' class ship when new player.
            const ship = ships['Explorer'];
            const shipData = new this.client.database.shipModel();

            ship.modules.forEach(m => {
                shipData.modules.push(modules[m]);
            });

            shipData.modulesMax = ship.sizeNum ^ 1.4 * ship.tier;

            // calculations
            const AP = common.calculateAP(shipData.modules);
            shipData.stats.AP = AP;
            const DP = common.calculateDP({ modules: shipData.modules, shipArmor: ship.armor });
            shipData.stats.DP = DP;

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
        // Randomly pick a location where from the hub locations
        const hub = galaxy.hubs[Math.floor(Math.random() * galaxy.hubs.length)];
        const x = hub.x; //rndInt(-Math.abs(galaxy.sectors), galaxy.sectors);
        const y = hub.y; //rndInt(-Math.abs(galaxy.sectors), galaxy.sectors);
        const z = 0;

        await this.warpTo({
            user: msg.user,
            data: {
                toGalaxy: {
                    x: galaxy.x,
                    y: galaxy.y
                },
                toCoord: {
                    x: x,
                    y: y,
                    z: z
                }
            }
        })
        return userData;
    }
    createGuild() {
        return new Promise(async (resolve, reject) => {
            const entry = await client.database.collection('guilds').findOne({
                guid
            })
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

    async setShipName(msg) {
        const userData = await this.getUser({
            user: msg.user,
            data: {
                isLean: false
            }
        });
        const ship = userData.ship;

        ship.name = msg.data.shipName;
        ship.save()
    }
}