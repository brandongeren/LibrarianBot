const FuzzySet = require('fuzzyset.js');
const request = require('sync-request');
const fs = require('fs');

let cardInfo = {}
// might have to update the path for cards.json;

let cards = [];

// grab our card database
downloadCards();

// every 24 hours, we want to download cards again
// if any new ones are released, we'll have them within 2 days
setInterval(downloadCards, 1000*60*60*24*2);
let cardSet = FuzzySet([], false);
// cardSetStrict is used when we're not very sure of the card that comes up as a match
// in that case, we check another database, which works better for substrings
let cardSetStrict = FuzzySet([], false, 3, 6)

const UNKNOWN_STATS = JSON.parse(fs.readFileSync('./data/unknown_stats.json'));

// map each type of card to its card color
const COLOR_MAP = {
  'Normal Monster': 16639626,
  'Effect Monster': 16747347,
  'Spell Card': 1941108,
  'Ritual Monster': 10335692,
  'Fusion Monster': 10520247,
  'Trap Card': 12343940,
  'Synchro Monster': 13421772,
  'XYZ Monster': 1052688,
  'Link Monster': 139,
  'Token': 6908265,
}

// map various monster types to the more simplified version
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

const CARD_TYPE_DESC_MAP = {
  'Normal Monster': '',
  'Pendulum Effect Monster': ' / Pendulum / Effect',
  'Flip Effect Monster': ' / Flip / Effect',
  'Effect Monster': ' / Effect',
  'Tuner Monster': ' / Tuner / Effect',
  'Synchro Monster': ' / Synchro / Effect',
  'XYZ Monster': ' / Xyz / Effect',
  'Fusion Monster': ' / Fusion / Effect',
  'Normal Tuner Monster': ' / Tuner',
  'Spirit Monster': ' / Spirit / Effect',
  'Link Monster': ' / Link',
  'Union Effect Monster': ' / Union / Effect',
  'Ritual Monster': ' / Ritual',
  'Ritual Effect Monster': ' / Ritual / Effect',
  'Gemini Monster': ' / Gemini / Effect',
  'Toon Monster': ' / Toon / Effect',
  'Pendulum Normal Monster': ' / Pendulum',
  'Pendulum Flip Effect Monster': ' / Pendulum / Flip / Effect',
  'Synchro Tuner Monster': ' / Synchro / Tuner / Effect',
  'XYZ Pendulum Effect Monster': ' / Xyz / Pendulum / Effect',
  'Pendulum Tuner Effect Monster': ' / Pendulum / Tuner / Effect',
  'Synchro Pendulum Effect Monster': ' / Synchro / Pendulum / Effect',
  'Pendulum Effect Fusion Monster': ' / Fusion / Pendulum / Effect',
  'Token': ' / Token',
  'Skill Card': ' / Skill',
}

// map attributes to their icons
const ATTRIBUTE_MAP = {
  'LIGHT': 'https://ygoprodeck.com/pics/LIGHT.jpg',
  'DARK': 'https://ygoprodeck.com/pics/DARK.jpg',
  'WIND': 'https://ygoprodeck.com/pics/WIND.jpg',
  'EARTH': 'https://ygoprodeck.com/pics/EARTH.jpg',
  'DIVINE': 'https://ygoprodeck.com/pics/DIVINE.jpg',
  'FIRE': 'https://ygoprodeck.com/pics/FIRE.jpg',
  'WATER': 'https://ygoprodeck.com/pics/WATER.jpg'
}

// map spell or trap types to their icons
const ST_TYPE_MAP = {
  'Continuous': 'https://ygoprodeck.com/pics/icons/Continuous.png',
  'Normal': 'https://ygoprodeck.com/pics/icons/Normal.png',
  'Quick-Play': 'https://ygoprodeck.com/pics/icons/Quick-Play.png',
  'Equip': 'https://ygoprodeck.com/pics/icons/Equip.png',
  'Field': 'https://ygoprodeck.com/pics/icons/Field.png',
  'Counter': 'https://ygoprodeck.com/pics/icons/Counter.png',
  'Ritual': 'https://ygoprodeck.com/pics/icons/Ritual.png'
}

for (let card of cards) {
  let cardName = card.name.toLowerCase();
  cardSet.add(cardName);
  cardSetStrict.add(cardName);
  if (card.type.includes('Monster')) {
    let undefined_stats = UNKNOWN_STATS[card.name];
    card.atk = undefined_stats && undefined_stats.atk || card.atk;
    card.def = undefined_stats && undefined_stats.def || card.def;
  }
  cardInfo[cardName] = card;
}

function downloadCards() {
  console.log('Downloading cards...');
  let cardsRaw = request('GET', 'https://db.ygoprodeck.com/api/v4/cardinfo.php');

  cards = JSON.parse(cardsRaw.getBody())[0];
  console.log('Done');
}

function findCard(input) {
  let name = input.toLowerCase();
  let match = cardSet.get(name, minScore=0.3);
  if (match) {
    let cardName = match[0][1];
    let confidence = match[0][0];
    if (confidence < 0.5) {
      let strictMatch = cardSetStrict.get(name, null, 0.3);
      if (strictMatch) {
        cardName = checkForMonarch(name, strictMatch) || strictMatch[0][1];
      }
    }
    return cardInfo[cardName];
  }
  else {
    return null;
  }
}

// bot unfortunately is dumb when searching for monarchs
// so we make a quick hack
function checkForMonarch(name, match) {
  let cardName = match[0][1];
  if (cardName.includes('mega monarch') && !name.includes('mega')) {
    cardName = match[1] && match[1][1];
    if (cardName) {
      return cardName;
    }
  } 
  return false;
}

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
    'embed': {
      'author': {
        'name': card.name,
        'icon_url': getTypeImage(card)
      },
      'description': makeDescription(card),
      'color': color,
      'thumbnail': {
        'url': card.image_url
      }
    }
  }

  return embed;
}

function makeDescription(card) {
  let description = '';

  const isST = isSpellTrap(card)
  const isXYZ = card.type.includes('XYZ');

  if (card.attribute) {
    description = description.concat('**Attribute**: ' + card.attribute + '\n');
  }

  if (card.race && isST) {
    description = description.concat('**Type**: ' + card.race + '\n');
  }

  if (card.level) {
    if (isXYZ) {
      description = description.concat('**Rank**: ' + card.level + '\n');
    } else {
      description = description.concat('**Level**: ' + card.level + '\n');
    }
  }

  else if (card.linkval && card.linkval !== '0') {
    description = description.concat('**Link Rating**: ' + card.linkval + '\n');
  }

  if (card.race && !isST) {
    description = description.concat(getCardTypeLine(card));
  }

  if (card.scale) {
    description = description.concat('**Scale:** ' + card.scale + '\n');
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
  if (card) {
    return makeEmbed(card);
  } else {
    return null;
  }
}

function getTypeImage(card) {
  if (isSpellTrap(card)) {
    return ST_TYPE_MAP[card.race];
  }

  return ATTRIBUTE_MAP[card.attribute];
}

function isSpellTrap(card) {
  return card.type === 'Spell Card' || card.type === 'Trap Card';
}

function getCardTypeLine(card) {
  const vanillaExtraDeckTypes = ['Fusion Monster', 'XYZ Monster', 'Link Monster', 'Synchro Monster'];
  /* problem: our card database kinda sucks
     basically, we need to know if a monster has an effect
     but the db doesn't tell us for extra deck monsters
     hacky solution: does the card have a line break in it?
     this doesn't always work though lmao
  */
 let cardType = CARD_TYPE_DESC_MAP[card.type];

  if (vanillaExtraDeckTypes.includes(card.type)) {
    if (!card.desc.includes('\n')) {
      cardType = cardType.replace(' / Effect', '');
    } else if (card.name === 'B. Skull Dragon') {
      // unfortunately, b. skull dragon has a line break
      cardType = cardType.replace(' / Effect', '');
    }

  }
  return '**[** ' + card.race + cardType + ' **]**\n';
}

exports.searchCards = searchCards;
