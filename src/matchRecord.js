require('console.table');
const pug = require('pug');
const path = require('path');
const fs = require('fs');
const [playerA, playerB] = require('minimist')(process.argv.slice(2))['_'];
const months = require('../data/months.json');
const list = months.map(fileName => require(`../data/matchInfo/${fileName}.json`));
const results = {};
list.forEach(records => {
  records.forEach(([winner, loser]) => {
    const winnerRecord = Object.assign({
      [loser]: {
        winCount: 0,
        loseCount: 0
      }
    }, results[winner]);
    winnerRecord[loser].winCount++;
    results[winner] = winnerRecord;
    const loserRecord = Object.assign({
      [winner]: {
        winCount: 0,
        loseCount: 0
      }
    }, results[loser]);
    loserRecord[winner].loseCount++;
    results[loser] = loserRecord;
  });
});
if(results[playerA]) {
  if(!playerB) {
      console.log(`${playerA}的对战记录为:`);
      console.log(result[playerA]);
  } else {
    const result = results[playerA][playerB];
    if(result) {
      const matchCount = result.winCount + result.loseCount;
      console.log(`${playerA}与${playerB}历史交锋${matchCount}次, 胜率${~~(result.winCount * 1000 / matchCount) / 10}%`);
    } else {
      console.log(`${playerA}与${playerB}尚未有过交手记录`);
    }
  }
} else {
  console.log(`${playerA}尚未参加过比赛`);
}
