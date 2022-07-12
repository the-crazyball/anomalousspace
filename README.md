![Anomalous Space](https://github.com/the-crazyball/anomalousspace/blob/main/client/shared/images/logo.png)

### The next evolution of Discord/Slack/Web/Mobile game. Procedurally generated universe with an emphasis on survival and story.

Built with NodeJS, JS, and DiscordJS.

The game is still in development and testing phase. Want to contribute, help and test, join the Discord server and read the How to contribute below.

[Website](https://www.anomalousspace.io) | [Official Discord](https://discord.gg/hUw2VmtzhX)

[How to contribute](CONTRIBUTING.md)

## Requirements

* [Discord Developer Bot Token](https://discord.com/developers/applications)
* [MongoDB](https://account.mongodb.com/account/login)
* Node 16.x or higher

## Getting Started

It's possible to run on [Replit](https://replit.com/) with the steps below.

### Server
* Install all necessary packages using "npm --prefix ./server/api/ install"
* Copy the config.example.json to config.dev.json, which can be found under ./server/api/src/settings/
* Change the secretKey (line 4) to a string of your choice
* Setup a [MongoDb](mongodb.com) database
* Make database access available from every IP address, which can be done by pressing "ALLOW ACCESS FROM ANYWHERE" when adding any IP address
* Add a new database user using the password method
* Locate your Database URL, usually found under "Database" -> "Connect" -> "Connect your application" (Remember to choose the password method!)
* Change the MongoDb host (line 8) to the MongoDb URL you found in the step above (Example: "mongodb+srv://<username>:<password>@cluster0.fhlbn.mongodb.net/?retryWrites=true&w=majority")

### Client
* Install all necessary packages using "npm --prefix ./client/discord/ install"
* Copy the config.example.js to config.dev.js, which can be found under ./client/discord/
* Change the API secret (line 5) to the same value as the secretKey on the server
* Change the token (line 20) to the Discord Bot token. A discord bot can be made on the official [Discord Developer]https://discord.com/developers/applications) page.
* Change the webhook (line 15) to a webhook on a Discord Channel (used for error display)
* Change the logwebhook (line 16) to a webhook on a Discord Channel (used for logging diplay)
* Make sure your bot is added to a server, before starting the Discord Client

### Starting the Client and Server
* Run the server "npm run sdev" and the client "npm run cdev"
* (Alternatively, just press Start on Replit, the package should behave.)