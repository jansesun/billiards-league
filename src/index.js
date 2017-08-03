require('console.table');
const pug = require('pug');
const path = require('path');
const fs = require('fs');
const months = require('../data/months.json');
const scoreWeight = {
  '冠军': 8,
  '亚军': 6,
  '4强': 4,
  '8强': 2,
  '16强': 1,
  '资格赛': 0
};
const list = months.map(fileName => require(`../data/leagueInfo/${fileName}.json`));
const formatMonths = months.map(month => `${month.replace('.', '年')}月`);
const championList = list.map((item, index) => ({
  ...item.champion,
  month: formatMonths[index]
}));
console.log('====champion List===');
console.table(championList);

const girlNumList = [];
const boyNumList = [];
const participants = list.forEach(item => {
  const { playerList } = item;
  const girlNum = playerList.filter(player => player.gender).length;
  girlNumList.push(girlNum);
  boyNumList.push(playerList.length - girlNum);
});
console.log('====参与人数====');
console.log('女生:', girlNumList);
console.log('男生:', boyNumList);

const totalNum = girlNumList.reduce((prev, cur, index) => prev + cur + boyNumList[index], 0);
console.log('====累计参与人次====');
console.log(totalNum);

const playerInfo = new Map();
let id = 0;
list.forEach((item, index) => {
  const { playerList } = item;
  playerList.forEach(player => {
    let info;
    if(playerInfo.has(player.name)) {
      info = playerInfo.get(player.name);
      info.partcipantNum++;
      info.points += scoreWeight[player.score];
      if(player.score === '冠军') {
        info.championNum++;
      }
      if(scoreWeight[player.score] > scoreWeight[info.personalBest]) {
        info.personalBest = player.score;
      }
      info.scoreList[index] = player.score;
    } else {
      const scoreList = Array(months.length);
      scoreList[index] = player.score;
      id++;
      info = {
        id,
        name: player.name,
        personalBest: player.score,
        points: scoreWeight[player.score],
        scoreList,
        partcipantNum: 1,
        championNum: player.score === '冠军' ? 1 : 0
      };
    }
    playerInfo.set(player.name, info);
  });
});
console.log('====累计参与人数====');
console.log(playerInfo.size);
console.log('====个人记录====');
const sortedPlayerList = [...playerInfo.values()];
sortedPlayerList.sort((a, b) => {
  if(scoreWeight[b.personalBest] === scoreWeight[a.personalBest]) {
    if(b.points === a.points) {
      return b.partcipantNum - a.partcipantNum;
    }
    return b.points - a.points;
  }
  return scoreWeight[b.personalBest] - scoreWeight[a.personalBest];
});
console.table(sortedPlayerList);
const personalBestCount = {};
const participantCount = Array.from({length: months.length}).fill(0);
sortedPlayerList.forEach(player => {
  const index = months.length - player.partcipantNum;
  personalBestCount[player.personalBest] = (personalBestCount[player.personalBest] || 0) + 1;
  participantCount[index] = participantCount[index] + 1;
});
console.log('====个人最好成绩分布====');
console.log(personalBestCount);
console.log('====参与次数分布====');
console.log(participantCount);
const isDebug = process.env.NODE_ENV !== 'production';
const fileName = isDebug ? 'index' : 'wiki';
const renderFunction = pug.compileFile(path.join(__dirname, `../template/${fileName}.pug`), {
  pretty: '  '
});
const html = isDebug ? renderFunction({
  isDebug,
  championList,
  months: formatMonths,
  monthsJson: JSON.stringify(months),
  partcipantNum: playerInfo.size,
  totalNum,
  girlNumList: JSON.stringify(girlNumList),
  boyNumList: JSON.stringify(boyNumList),
  participantCount: JSON.stringify(participantCount),
  participantTimes: JSON.stringify(participantCount.map((item, index) => months.length - index)),
  personalBestCount: JSON.stringify(Object.values(personalBestCount)),
  scoreList: JSON.stringify(Object.keys(personalBestCount)),
  playerList: sortedPlayerList
}) : renderFunction({
  isDebug,
  championList,
  months: formatMonths,
  monthsJson: months,
  partcipantNum: playerInfo.size,
  totalNum,
  girlNumList,
  boyNumList,
  participantCount,
  participantTimes: participantCount.map((item, index) => months.length - index),
  personalBestCount:Object.values(personalBestCount),
  scoreList: Object.keys(personalBestCount).map(score => ({
    '冠军': 'Champion',
    '亚军': 'Secord',
    '4强': 'Top 4',
    '8强': 'Top 8',
    '16强': 'Top 16',
    '资格赛': 'Qualification'
  })[score]),
  playerList: sortedPlayerList
});
fs.writeFileSync(path.join(__dirname, `../page/${fileName}.html`), html);


