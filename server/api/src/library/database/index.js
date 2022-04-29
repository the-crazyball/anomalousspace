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

    this.userModel = require("./models/user");
    this.shipModel = require("./models/ship");
    this.guildModel = require("./models/guild")(this.client.apiSettings);

    this.sectorModel = require("./models/sector");
    this.stellarObjectModel = require("./models/stellarObject");
    this.astronomicalObjectModel = require("./models/astronomicalObject");
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
      let user = (isLean ? await this.userModel.findOne({ discordId: userID }).populate('ship').lean() : await this.userModel.findOne({ discordId: userID }).populate('ship'));
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
  async findOrCreateSector({ x, y, z }) {
    if(this.cache.sectors.get(`${x}${y}${z}`)){
      return this.cache.sectors.get(`${x}${y}${z}`);
    } else {
      let sector = await this.sectorModel.findOne({ x, y, z }).populate('stellarObjects');
      if(sector){
        this.cache.sectors.set(`${x}${y}${z}`, sector);
        return sector;
      } else {
        sector = new this.sectorModel({ x, y, z });
        await sector.save();
        this.cache.sectors.set(`${x}${y}${z}`, sector);
        return sector;
      }
    }
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