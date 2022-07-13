/*
Logger class for easy and aesthetically pleasing console logging
*/
const { cyan, red, magenta, gray, yellow, white, green } = require("colorette");
const { Timestamp } = require("@sapphire/time-utilities");
const Winston = require("winston");
require("winston-syslog");

let winston = null;

exports.init = (config) => {
    if (config.papertrail.host && config.papertrail.port) {
        const papertrail = new (Winston.transports).Syslog({
            host: config.papertrail.host,
            port: config.papertrail.port,
            protocol: 'tls4',
            app_name: '[Discord]-Client',
            localhost: require('os').hostname(),
            eol: '\n',
        });

        winston = Winston.createLogger({
            format: Winston.format.simple(),
            levels: Winston.config.syslog.levels,
            transports: [papertrail]
        });
    }
};

exports.log = (content, type = "log") => {
    const timestamp = `[${cyan(new Timestamp("YYYY-MM-DD HH:mm:ss"))}]:`;

    switch (type) {
        case "log": {
            if (winston) {
                winston.info(`${gray(type.toUpperCase())} ${content}`);
            }
            return console.log(`${timestamp} ${gray(type.toUpperCase())} ${content} `);
        }
        case "warn": {
            if (winston) {
                winston.warn(`${yellow(type.toUpperCase())} ${content}`);
            }
            return console.log(`${timestamp} ${yellow(type.toUpperCase())} ${content} `);
        }
        case "error": {
            if (winston) {
                winston.error(`${red(type.toUpperCase())} ${content}`);
            }
            return console.log(`${timestamp} ${red(type.toUpperCase())} ${content} `);
        }
        case "debug": {
            if (winston) {
                winston.debug(`${magenta(type.toUpperCase())} ${content}`);
            }
            return console.log(`${timestamp} ${magenta(type.toUpperCase())} ${content} `);
        }
        case "cmd": {
            if (winston) {
                winston.info(`${white(type.toUpperCase())} ${content}`);
            }
            return console.log(`${timestamp} ${white(type.toUpperCase())} ${content}`);
        }
        case "ready": {
            if (winston) {
                winston.info(`${green(type.toUpperCase())} ${content}`);
            }
            return console.log(`${timestamp} ${green(type.toUpperCase())} ${content}`);
        }
        default: throw new TypeError("Logger type must be either warn, debug, log, ready, cmd or error.");
    }
};

exports.error = (...args) => this.log(...args, "error");

exports.warn = (...args) => this.log(...args, "warn");

exports.debug = (...args) => this.log(...args, "debug");

exports.cmd = (...args) => this.log(...args, "cmd");