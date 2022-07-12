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
* Copy the config.example.json to config.dev.json
* Change the secretKey to something else, this will be used on the client side as well
* Change the MongoDb host to the MongoDb URL example: mongodb+srv://<username>:<password>@cluster0.fhlbn.mongodb.net/as_dev?retryWrites=true&w=majority

### Client
* Copy the config.example.js to config.dev.js
* Change the API secret to the same value as secretKey on the server
* Change the token to the Discord Bot token
* Change the webhook to a webhook on a Discord Channel (used for error display)
* Change the logwebhook to a webhook on a Discord Channel (used for logging diplay)
* Make sure your bot is added to a server, before starting the Discord Client

### Starting the Client and Server
* Run the server npm run sdev and the client npm run cdev