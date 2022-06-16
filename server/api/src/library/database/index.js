'use strict'

const MongoClient = require('mongodb').MongoClient
const mongoose = require("mongoose");

module.exports = class Database {
  constructor(client) {
    this.client = client;

    this.cache = {};
		this.cache.users = new Map();
    this.cache.guilds = new Map();
    this.cache.sectors = new Map();
    this.cache.galaxies = new Map();
    this.cache.stellarObjects = new Map();
    this.cache.astronomicalObjects = new Map();

    this.userModel = require("./models/user");
    this.shipModel = require("./models/ship");
    this.guildModel = require("./models/guild")(this.client.apiSettings);

    this.sectorModel = require("./models/sector");
    this.stellarObjectModel = require("./models/stellarObject");
    this.astronomicalObjectModel = require("./models/astronomicalObject");
    this.galaxyModel = require("./models/galaxy");
  }
  async deleteGuild({ id: guildID }) {
    if(this.cache.guilds.get(guildID))
      this.cache.guilds.delete(guildID);

    let guild = await this.guildModel.findOne({ id: guildID });
		if (guild)
      await this.guildModel.deleteOne({ id: guildID });

    return true;
  }
  async findOrCreateGuild({ id: guildID, name: guildName, ownerId }, isLean) {
		if(this.cache.guilds.get(guildID)){
			return isLean ? this.cache.guilds.get(guildID).toJSON() : this.cache.guilds.get(guildID);
		} else {
			let guild = (isLean ? await this.guildModel.findOne({ id: guildID }).lean() : await this.guildModel.findOne({ id: guildID }));
			if(guild){
				if(!isLean) this.cache.guilds.set(guildID, guild);
				return guild;
			} else {
				guild = new this.guildModel({ id: guildID, name: guildName, ownerId });
				await guild.save();
				this.cache.guilds.set(guildID, guild);
				return isLean ? guild.toJSON() : guild;
			}
		}
	}
  async findOrCreateUser({ id: userID, username, discriminator }, isLean) {
    if(this.cache.users.get(userID)){
      return isLean ? this.cache.users.get(userID).toJSON() : this.cache.users.get(userID);
    } else {
      let user = (isLean ? await this.userModel.findOne({ discordId: userID }).populate({ 
        path: 'ship', 
        populate: [{ path: 'galaxy' }, { path: 'sector', populate: [{path: 'stellarObjects'}, {path: 'astronomicalObjects'}] }]
      }).lean() : await this.userModel.findOne({ discordId: userID }).populate({ 
        path: 'ship', 
        populate: [{ path: 'galaxy' }, { path: 'sector', populate: [{path: 'stellarObjects'}, {path: 'astronomicalObjects'}] }] 
      }));
      if(user){
        if(!isLean) this.cache.users.set(userID, user);
        return user;
      } else {
        user = new this.userModel({ discordId: userID, discordUsername: username, discordDiscriminator: discriminator });
        await user.save();
        this.cache.users.set(userID, user);
        return isLean ? user.toJSON() : user;
      }
    }
  }
  async findOrCreateGalaxy(data) {
    if(this.cache.galaxies.get(`${data.x}${data.y}`)){
      return this.cache.galaxies.get(`${data.x}${data.y}`);
    } else {
      let galaxy = await this.galaxyModel.findOne({ x: data.x, y: data.y });
      if(galaxy){
        this.cache.galaxies.set(`${data.x}${data.y}`, galaxy);
        return galaxy;
      } else {
        galaxy = new this.galaxyModel({ 
          name: data.name,
          sectors: data.sectors,
          type: data.type,
          color: data.color,
          x: data.x,
          y: data.y,
          hubs: data.hubs,
          size: data.size
        });
        await galaxy.save();
        this.cache.galaxies.set(`${data.x}${data.y}`, galaxy);
        return galaxy;
      }
    }
  }
  async findOrCreateSector({ galaxy: galaxy, sector: { x, y, z } }) {
    // key is generated based on the galaxy coordinates and sector coordinates.
    const key = `${galaxy.x}${galaxy.y}${galaxy.z}-${x}${y}${z}`;

    if(this.cache.sectors.get(key)){
      return this.cache.sectors.get(key);
    } else {
      let sector = await this.sectorModel.findOne({ galaxy, x, y, z }).populate([{path: 'astronomicalObjects', populate: [{ path: 'ownedBy', select: 'discordUsername rank' }] }, 'stellarObjects', 'galaxy']);
      if(sector){
        this.cache.sectors.set(key, sector);
        return sector;
      } else {
        sector = new this.sectorModel({ x, y, z, galaxy });
        await sector.save();
        this.cache.sectors.set(key, sector);
        return sector;
      }
    }
  }
  async findSector({ galaxy: galaxy, sector: { x, y, z } }) {
    // key is generated based on the galaxy coordinates and sector coordinates.
    const key = `${galaxy.x}${galaxy.y}${galaxy.z}-${x}${y}${z}`;

    if(this.cache.sectors.get(key)){
      return this.cache.sectors.get(key);
    } else {
      let sector = await this.sectorModel.findOne({ galaxy, x, y, z }).populate(['astronomicalObjects', 'stellarObjects', 'galaxy']);
      if(sector){
        this.cache.sectors.set(key, sector);
        return sector;
      } else {
        return false;
      }
    }
  }
  async findOrCreateStellarObject({ galaxy, sector }) {
    // key is generated based on the galaxy coordinates and sector coordinates.
    const key = `${galaxy.x}${galaxy.y}${galaxy.z}-${sector.x}${sector.y}${sector.z}`;

    if(this.cache.stellarObjects.get(key)){
      return this.cache.stellarObjects.get(key);
    } else {
      let stellarObject = await this.stellarObjectModel.findOne({ sector }).populate('sector');
      if(stellarObject){
        this.cache.stellarObjects.set(key, stellarObject);
        return stellarObject;
      } else {
        stellarObject = new this.stellarObjectModel({
          sector
         });
        await stellarObject.save();
        this.cache.stellarObjects.set(key, stellarObject);
        return stellarObject;
      }
    }
  }
  async findOrCreateAstronomicalObject({ galaxy, sector, objectId }) {
    // key is generated based on the galaxy coordinates and sector coordinates.
    const key = `${galaxy.x}${galaxy.y}${galaxy.z}-${sector.x}${sector.y}${sector.z}-${objectId}`;

    if(this.cache.astronomicalObjects.get(key)){
      return this.cache.astronomicalObjects.get(key);
    } else {
      let astronomicalObject = await this.astronomicalObjectModel.findOne({ sector, objectId }).populate(['sector', 'ownedBy']);
      if(astronomicalObject){
        this.cache.astronomicalObjects.set(key, astronomicalObject);
        return astronomicalObject;
      } else {
        astronomicalObject = new this.astronomicalObjectModel({
          sector,
          objectId
         });
        await astronomicalObject.save();
        this.cache.astronomicalObjects.set(key, astronomicalObject);
        return astronomicalObject;
      }
    }
  }
  async getUsers() {
    let users = await this.userModel.find({}).select('stats discordId discordUsername credits rank');
    return users;
  }
  async getColonies(user) {
    let astronomicalObjects = await this.astronomicalObjectModel.find({ ownedBy: user._id }).populate([{ path: 'sector', populate: { path: 'galaxy' } }, 'ownedBy']);

    // check if the astronomical objects are part of the database cache
    astronomicalObjects.forEach(o => {
      const key = `${o.sector.galaxy.x}${o.sector.galaxy.y}${o.sector.galaxy.z}-${o.sector.x}${o.sector.y}${o.sector.z}-${o.objectId}`;
      
      if(!this.cache.astronomicalObjects.get(key)){
        this.cache.astronomicalObjects.set(key, o);
      }
    })  

    return astronomicalObjects;
  }
  connect() {
    return new Promise((resolve, reject) => {
      const { host } = this.client.apiSettings.mongodb

      mongoose.connect(host, {
        useNewUrlParser: true,
        useUnifiedTopology: true
      }).then(
        () => { 
            this.client.database = this;
            resolve();
        },
        err => {
            reject(new Error(err));
        }  
      )
    })
  }
}