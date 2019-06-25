const findCards = require('./findCards.js');
const fs = require('fs');
const defaults = JSON.parse(fs.readFileSync("./config/defaults.json", "utf8"));

let brackets = defaults.brackets;

function findCommands(msg) {
  // card search
  const findQueries = new RegExp(regexEscape(brackets[0]) + "(.+?)" + regexEscape(brackets[1]), "g");
  const content = msg.content.toLowerCase();
  let match = findQueries.exec(content);
  let results = [];
  while (match !== null) {
    // match is an array of things
    // it turns out that match[1] is simply the name of the card
    results.push(match[1]);

    // each additional execution finds the next match,
    // if there is no new match, then match is null
    match = findQueries.exec(content);
  }

  for (let query of results) {
    let res = findCards.searchCards(query);
    if (res && res.embed) {
      msg.channel.sendEmbed(res.embed);
    } else {
      msg.channel.send('Error: could not find card ' + query);
    }
  }

  if (msg.content === '!github') {
    // test embed here:
    // https://leovoel.github.io/embed-visualizer/
    let embed = {
      "description": "**See a bug?**\n[Open an issue](https://github.com/brandongeren/SeerBot).\n\n**Want to contribute?**\n[Make a pull request](https://github.com/brandongeren/SeerBot)\n\n**Just want to see the source code?**\n[Click here](https://github.com/brandongeren/SeerBot)\n\n**Want to help develop a new dueling sim?**\nReach out to me via Discord message\nAnarchist Duelist#0166",
      "color": 16711680,
      "image": {
        "url": "https://avatars0.githubusercontent.com/u/9919?s=280&v=4"
      },
      "author": {
        "name": "Anarchist Duelist",
        "url": "https://github.com/brandongeren",
        "icon_url": "https://cdn.discordapp.com/avatars/379361995779997717/2766136dd6a7b5ebd01435aa7794aaa3.png?size=256"
      }
    }
    msg.channel.sendEmbed(embed);
  }
}

function regexEscape(str) {
  return str.replace(/[-\/\\^$*+?.()|[\]{}]/g, "\\$&");
}

exports.findCommands = findCommands;