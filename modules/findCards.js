const FuzzySet = require('fuzzyset.js');
const fs = require('fs');

let cardInfo = {}
// might have to update the path for cards.json;
let cards = JSON.parse(fs.readFileSync('./data/cards.json'))[0];
let cardSet = FuzzySet([], false);

const COLOR_MAP = {
  // TODO: add the colors for the egyption god cards
  "Normal Monster": 16639626,
  "Effect Monster": 16747347,
  "Spell Card": 1941108,
  "Ritual Monster": 10335692,
  "Fusion Monster": 10520247,
  "Trap Card": 12343940,
  "Synchro Monster": 13421772,
  "XYZ Monster": 1052688,
  "Link Monster": 139,
}

const CARD_TYPE_MAP = {
  'Pendulum Effect Monster': 'Effect Monster',
  'Flip Effect Monster': 'Effect Monster',
  'Pendulum Flip Effect Monster': 'Effect Monster',
  'Pendulum Tuner Effect Monster': 'Effect Monster',
  'Union Effect Monster': 'Effect Monster',
  'Toon Monster': 'Effect Monster',
  'Tuner Monster': 'Effect Monster',
  'Spirit Monster': 'Effect Monster',
  'Gemini Monster': 'Effect Monster',
  'Normal Tuner Monster': 'Normal Monster',
  'Pendulum Normal Monster': 'Normal Monster',
  'Ritual Effect Monster': 'Ritual Monster',
  'XYZ Pendulum Effect Monster': 'XYZ Monster',
  'Pendulum Effect Fusion Monster': 'Fusion Monster',
  'Synchro Tuner Monster': 'Synchro Monster',
  'Synchro Pendulum Effect Monster': 'Synchro Monster'
}

for (let card of cards) {
  cardName = card.name.toLowerCase();
  cardSet.add(cardName);
  cardInfo[cardName] = card;
}

function findCard(input) {
  let name = input.toLowerCase();
  let match = cardSet.get(name);
  if (match) {
    cardName = match[0][1];
    return cardInfo[cardName];
  }
  else {
    return 'No card found, try again.'
  }
}

/* Props
  'id',
  'name',
  'type',
  'desc',
  'race',
  'set_tag',
  'setcode',
  'image_url',
  'image_url_small',
  'cardmarket_price',
  'tcgplayer_price',
  'ebay_price',
  'amazon_price',
  'atk',
  'def',
  'level',
  'attribute',
  'scale',
  'archetype',
  'ban_tcg',
  'ban_ocg',
  'linkval',
  'ban_goat'
*/

// test embed here:
// https://leovoel.github.io/embed-visualizer/
function makeEmbed(card) {
  let color = 16777215;

  // TODO: clean this up
  if (COLOR_MAP[card.type]) {
    color = COLOR_MAP[card.type];
  } else {
    let cardColorType = CARD_TYPE_MAP[card.type];
    if (cardColorType) {
      if (COLOR_MAP[cardColorType]) {
        color = COLOR_MAP[cardColorType];
      }
    }  
  }
  let embed = {
    "embed": {
      "title": card.name,
      "description": makeDescription(card),
      "color": color,
      "thumbnail": {
        "url": card.image_url
      }
    }
  }

  return embed;
}

function makeDescription(card) {
  // TODO: include spell/trap card type (e.g. counter, continuous)
  let description = '';

  const isST = card.type === 'Spell Card' || card.type === 'Trap Card';
  const isXYZ = card.type.includes('XYZ');

  if (card.attribute) {
    description = description.concat("**Attribute**: " + card.attribute + "\n");
  }

  if (card.race && isST) {
    description = description.concat("**Type**: " + card.race + "\n");
  }

  if (card.level) {
    if (isXYZ) {
      description = description.concat("**Rank**: " + card.level + "\n");
    } else {
      description = description.concat("**Level**: " + card.level + "\n");
    }
  }

  else if (card.linkval) {
    description = description.concat("**Link Rating**: " + card.linkval + "\n");
  }

  if (card.race && !isST) {
    description = description.concat("**[** " + card.race + " **]**\n");
  }

  // TODO: make the description header
  // e.g. Formula Synchron: [ Machine / Synchro / Tuner / Effect ]

  if (card.desc) {
    description = description.concat('\n' + card.desc + '\n'); 
  }

  if (card.atk) {
    description = description.concat('\n**ATK** ' + card.atk);
    if (card.def) {
      description = description.concat(' **DEF** ' + card.def);
    }
    description = description.concat('\n');
  }

  return description;
}

function searchCards(name) {
  let card = findCard(name);
  return makeEmbed(card);
}

exports.searchCards = searchCards;