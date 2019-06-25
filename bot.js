require('dotenv').config();
const Discord = require('discord.js');
const commands = require('./modules/commands');

const client = new Discord.Client();

client.on('ready', () => {
  console.log(`Logged in as ${client.user.tag}!`);
});

// TODO: update permissions
client.on('message', async (msg) => {
  // don't do anything if a bot messages
  if (msg.author.bot || !msg.content) {
    return;
  }
  
  commands.findCommands(msg);
});

client.login(process.env.TOKEN);
