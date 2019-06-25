const fs = require('fs');
const FuzzySet = require('fuzzyset.js');

let cardInfo = {}
// might have to update the path for cards.json;
let cards = JSON.parse(fs.readFileSync('data/cards.json'))[0];
let cardSet = FuzzySet([], false);

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
    console.log(cardInfo[cardName]);
  }
  else {
    console.log('fuck you');
  }
}
