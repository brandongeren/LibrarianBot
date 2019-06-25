require('dotenv').config();
const Discord = require('discord.js');
const findCards = require('./modules/findCards.js');
const fs = require('fs');

const client = new Discord.Client();
const defaults = JSON.parse(fs.readFileSync("./config/defaults.json", "utf8"));

client.on('ready', () => {
  console.log(`Logged in as ${client.user.tag}!`);
});

// TODO: update permissions
client.on('message', async (msg) => {
  if (msg.content === '!ping') {
    msg.channel.send('pong');
  }

  // don't do anything if a bot messages
  if (msg.author.bot || !msg.content) {
    return;
  }
  const content = msg.content.toLowerCase().trim();

  let brackets = defaults.brackets;
  /* TODO: this should not be startsWith and endsWith,
     rather, it should be splitting the string and looking at each split
  */
  if (content.startsWith(brackets[0]) && content.endsWith(brackets[1])) {
    let query = content.slice(1, -1);
    console.log('query: ' + query);
    let res = findCards.searchCards(query);
    console.log(res);
    if (res.embed) {
      msg.channel.sendEmbed(res.embed);
    } else {
      msg.channel.send('error');
    }
  }
});

client.login(process.env.TOKEN);
