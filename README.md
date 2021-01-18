# RekichoLand-bot

A simple discord bot I made for my private server. Here's a list of available features:

* Voice-to-text linking
* Reaction roles
* Polls

## Pre-Requisites

- [NodeJS](https://nodejs.org/en/)

## Usage

In development, run the `dev` script, which will hot reload your code.

```bash
$ npm run dev
```

In "production", just run the `start` script. You'll probably want something like `pm2` to make the bot start automatically after booting your computer, or follow the deployment guide so the bot is always online.

```bash
$ npm start
```

## Deployment

Want to add this bot to your server? First, you need to create your own bot account in discord using [this guide](https://discordjs.guide/preparations/setting-up-a-bot-application.html#creating-your-bot). Then, you can easily deploy it to Heroku for free using [this guide](https://elements.heroku.com/buildpacks/synicalsyntax/discord.js-heroku). Bear in mind that you should provision a [PostgreSQL instance](https://elements.heroku.com/addons/heroku-postgresql). Additionally, you need to go to the `Config Vars` section of your Heroku dashboard settings, and add two variables: `PGSSLMODE`, which should have the value `no-verify`, and `CLIENT_TOKEN`, which you can obtain in your discord apps dashboard. Finally, you can invite the bot to your server using the link `https://discord.com/oauth2/authorize?client_id=XXXXXXXXX&scope=bot&permissions=268444688`. You need to find the `client_id` value in your bot dashboard as well.

## Commands

### Polls

This command will create a poll with a question and multiple answers, from a minimum of 2 and a maximum of 7. To answer the poll, the user only needs to react with the appropriate emoji.

```
rl poll <question> <answerX>, ...
```

### Reaction Roles

You need to be a server administrator to use these commands.

#### Add reaction role

This command will create a discord role and associate it with the given emoji. It will also update the roles message if it has already been published.

```
rl rr add <role> <emoji>
```

#### Remove reaction role

This command will delete the discord role with the given name if it exists. It will also update the roles message if it has already been published.

```
rl rr rm <role>
```

#### Publish roles message

This command will publish a message on the given channel enumerating the existing reaction roles. The users should then react with the appropriate emojis to be given their roles.

```
rl rr publish <channel>
```

### List reaction roles

This command will list the existing reaction roles.

```
rl rr ls
```

#### Reset reaction roles

This command will erase every reaction role and delete the roles message, if it exists.

```
rl rr reset
```
