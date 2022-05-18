const axios = require('axios');

module.exports = client => {

    /* Create a bsae isntance config for axios */
    const instance = axios.create({
        baseURL: `http://${client.config.api.host}:${client.config.api.port}`,
        timeout: client.config.api.request_timeout,
        headers: {
            secretKey: client.config.api.secret
        }
    });

    return {
        healthCheck: function() {
            return new Promise((resolve, reject) => {
                instance.get('/healthCheck')
                    .then(res => {
                        if (res.data && res.data.status === 'up') resolve(true);
                        else reject(new Error('Unexpected Response from api.'));
                    })
                    .catch(e => {
                        reject(e);
                    });
            });
        },
        jumpTo: function(user, blueprint) {
            return new Promise((resolve, reject) => {
                instance.post(`/jump/to`, { user, blueprint })
                    .then(res => {
                        if (res.data && res.data.status === 'success') {
                            resolve(res.data.result);
                        } else if (res.data && res.data.status === 'error') {
                            client.logger.log(`API request\n'${res.data.reason}'`, "error");
                        } else reject(new Error('Unexpected Response from api.'));
                    })
                    .catch(e => {
                        client.logger.log(`API request error: '${e.response.data.status}', URL: '${e.config.url}'`, "error");
                        reject(e);
                    });
            });
        },
        warpTo: function(user, blueprint) {
            return new Promise((resolve, reject) => {
                instance.post(`/warp/to`, { user, blueprint })
                    .then(res => {
                        if (res.data && res.data.status === 'success') {
                            resolve(res.data.result);
                        } else if (res.data && res.data.status === 'error') {
                            client.logger.log(`API request\n'${res.data.reason}'`, "error");
                        } else reject(new Error('Unexpected Response from api.'));
                    })
                    .catch(e => {
                        client.logger.log(`API request error: '${e.response.data.status}', URL: '${e.config.url}'`, "error");
                        reject(e);
                    });
            });
        },
        getMap: function(user, blueprint) {
            return new Promise((resolve, reject) => {
                instance.post(`/map/get`, { user, blueprint })
                    .then(res => {
                        if (res.data && res.data.status === 'success') {
                            resolve(res.data.result);
                        } else if (res.data && res.data.status === 'error') {
                            client.logger.log(`API request\n'${res.data.reason}'`, "error");
                        } else reject(new Error('Unexpected Response from api.'));
                    })
                    .catch(e => {
                        client.logger.log(`API request error: '${e.response.data.status}', URL: '${e.config.url}'`, "error");
                        reject(e);
                    });
            });
        },
        getCooldowns: function(user, blueprint) {
            return new Promise((resolve, reject) => {
                instance.post(`/cooldowns/get`, { user, blueprint })
                    .then(res => {
                        if (res.data && res.data.status === 'success') {
                            resolve(res.data.result);
                        } else if (res.data && res.data.status === 'error') {
                            client.logger.log(`API request\n'${res.data.reason}'`, "error");
                        } else reject(new Error('Unexpected Response from api.'));
                    })
                    .catch(e => {
                        client.logger.log(`API request error: '${e.response.data.status}', URL: '${e.config.url}'`, "error");
                        reject(e);
                    });
            });
        },
        mine: function(user, blueprint) {
            return new Promise((resolve, reject) => {
                instance.post(`/mining/mine`, { user, blueprint })
                    .then(res => {
                        if (res.data && res.data.status === 'success') {
                            resolve(res.data.result);
                        } else if (res.data && res.data.status === 'error') {
                            client.logger.log(`API request\n'${res.data.reason}'`, "error");
                        } else reject(new Error('Unexpected Response from api.'));
                    })
                    .catch(e => {
                        client.logger.log(`API request error: '${e.response.data.status}', URL: '${e.config.url}'`, "error");
                        reject(e);
                    });
            });
        },
        scan: function(user, blueprint) {
            return new Promise((resolve, reject) => {
                instance.post(`/scan/${blueprint.type}`, { user, blueprint })
                    .then(res => {
                        if (res.data && res.data.status === 'success') {
                            resolve(res.data.result);
                        } else if (res.data && res.data.status === 'error') {
                            client.logger.log(`API request\n'${res.data.reason}'`, "error");
                        } else reject(new Error('Unexpected Response from api.'));
                    })
                    .catch(e => {
                        client.logger.log(`API request error: '${e.response.data.status}', URL: '${e.config.url}'`, "error");
                        reject(e);
                    });
            });
        },
        warpStart: function(user) {
            return new Promise((resolve, reject) => {
                instance.post('/warp/start', { user })
                    .then(res => {
                        if (res.data && res.data.status === 'success') {
                            resolve(res.data.user);
                        } else if (res.data && res.data.status === 'error') {
                            client.logger.log(`API request\n'${res.data.reason}'`, "error");
                        } else reject(new Error('Unexpected Response from api.'));
                    })
                    .catch(e => {
                        client.logger.log(`API request error: '${e.response.data.status}', URL: '${e.config.url}'`, "error");
                        reject(e);
                    });
            });
        },
        deleteGuild: function(guild) {
            return new Promise((resolve, reject) => {
                instance.post('/guild/delete', { guild })
                    .then(res => {
                        if (res.data && res.data.status === 'success') {
                            resolve(true);
                        } else reject(new Error('Unexpected Response from api.'));
                    })
                    .catch(e => {
                        client.logger.log(`API request error: '${e.response.data.status}', URL: '${e.config.url}'`, "error");
                        reject(e);
                    });
            });
        },
        getGuild: function(guild) {
            return new Promise((resolve, reject) => {
                instance.post('/guild/get', { guild })
                    .then(res => {
                        if (res.data && res.data.status === 'success') {
                            resolve({
                                prefix: res.data.guild.prefix
                            });
                        } else reject(new Error('Unexpected Response from api.'));
                    })
                    .catch(e => {
                        client.logger.log(`API request error: '${e.response.data.status}', URL: '${e.config.url}'`, "error");
                        reject(e);
                    });
            });
        },
        getUser: function(user) {
            return new Promise((resolve, reject) => {
                instance.post('/user/get', { user })
                    .then(res => {
                        if (res.data && res.data.status === 'success') {
                            resolve(res.data.user);
                        } else if (res.data && res.data.status === 'error') {
                            client.logger.log(`API request\n'${res.data.reason}'`, "error");
                        } else reject(new Error('Unexpected Response from api.'));
                    })
                    .catch(e => {
                        client.logger.log(`API request error: '${e.response.data.status}', URL: '${e.config.url}'`, "error");
                        reject(e);
                    });
            });
        }/*,
        statPoster: setInterval(() => {
            if (process.argv.includes('-d')) return // Dont post stats if we are in dev mode

            instance.post('/stats/bot', {
              guilds: client.guilds.cache.size,
              users: client.users.cache.size,
              shards: parseInt(client.options.shards) + 1
            })
              .then(res => {
                if (res.data.status === 'success') console.log('Successfully posted stats to api.')
                else console.log('Unexpected Response from api.')
              })
              .catch(e => console.log(`Error sending post request to api: ${e}`))
        }, client.config.api.stat_post_ms)*/
    };
};