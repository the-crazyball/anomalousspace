'use strict'
const Winston = require("winston");
require("winston-syslog");

module.exports = class Logger {
    constructor(config) {
        if (config.papertrail.host && config.papertrail.port) {
            const papertrail = new (Winston.transports).Syslog({
                host: config.papertrail.host,
                port: config.papertrail.port,
                protocol: 'tls4',
                app_name: '[API] Server',
                localhost: require('os').hostname(),
                eol: '\n',
            });
    
            this.winston = Winston.createLogger({
                format: Winston.format.simple(),
                levels: Winston.config.syslog.levels,
                transports: [papertrail]
            });
        }

    }
    log(content) {
        console.log(content);
        if (this.winston) {
            this.winston.info(`${content}`);
        }
    }
}