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
}

function regexEscape(str) {
  return str.replace(/[-\/\\^$*+?.()|[\]{}]/g, "\\$&");
}

exports.findCommands = findCommands;