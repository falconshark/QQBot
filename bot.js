const fs = require('fs');
const request = require('request');
const Koa = require('koa');
const bodyParser = require('koa-bodyparser');
const sqlite3 = require("sqlite3").verbose();
const QQ = require('./lib/qq');
const Common = require('./lib/common');
const Weibo = require('./lib/weibo');
const DB = require('./lib/database');

const config = JSON.parse(fs.readFileSync('./config.json', 'utf8'));
const db = new sqlite3.Database('./save.db');
//Create table before run anything
db.serialize(function() {
  db.run('CREATE TABLE IF NOT EXISTS Weibo (id TEXT)');
});
const app = new Koa();

app.use(bodyParser());
app.use(async ctx => {
  const qqMessage = ctx.request.body;
  if(qqMessage){
    ctx.body = 'Get message!';
    const messageContent = ctx.request.body.raw_message;
    const command = QQ.readCommand(messageContent);
    const messageType = ctx.request.body.message_type;
    const userId = ctx.request.body.user_id;
    let senderId = userId;
    //如果發送者為群，將senderId設為group_id
    if(ctx.request.body.group_id){
      senderId = ctx.request.body.group_id;
    }
    switch(command){
      case 'help':
      _getHelp(senderId, messageType);
      break;

      case 'roll':
      _roll(senderId, messageType, messageContent);
      break;

      case 'choose':
      _choose(senderId, messageType, messageContent);
      break;
    }
  }else{
    ctx.body = 'Please provide QQ message.';
  }
});

app.listen(5555);
console.log('Start at 5555 port.');

_getFFWeibo(request, config);

setInterval(function(){
  _getFFWeibo(request, config);
}, 3600000);

function _getHelp(senderId, messageType){
  let content = '目前指令：';
  content += '\n /roll (骰子數量)d(骰子面數) 擲骰功能。範例：1顆100面的骰子= 1d100';
  content += '\n /choose (選項) 睡鼠老師，幫我選擇！格式範例：選項1|選項2。建議小窗使用。';
  QQ.sendMessage(request, senderId, messageType, content).then((result) => {
    console.log(result);
  });
}
function _roll(senderId, messageType, messageContent){
  const rollRegax = /(\/roll) ([0-9]+)d([0-9]+)/;
  const diceNumber = parseInt(rollRegax.exec(messageContent)[2]);
  const rollNumber = parseInt(rollRegax.exec(messageContent)[3]);
  const rollResult = Common.rollDice(diceNumber, rollNumber).toString();
  const content = diceNumber + 'd' + rollNumber + '擲骰結果：' + rollResult;
  QQ.sendMessage(request, senderId, messageType, content).then((result) => {
    console.log(result);
  }).catch((err) => {
    console.log(err);
  });
}
function _choose(senderId, messageType, messageContent){
  const chooseRegax = /^(\/choose) ([\s\S]*)$/;
  const optionsString = chooseRegax.exec(messageContent)[2];
  const options = optionsString.split('|');
  let content = '';
  if(options.length !== 0){
    const result = Common.choose(options);
    content = '隨機選擇結果：' + result;
  }else{
    content = '格式不符合！';
  }
  QQ.sendMessage(request, senderId, messageType, content).then((result) => {
    console.log(result);
  }).catch((err) => {
    console.log(err);
  });
}

async function _getFFWeibo(request, config){
  const weiboPage = await Weibo.fetchFF(request, config);
  const latestWeibo = Weibo.parseFF(weiboPage);
  const content = `${latestWeibo.content} \n 原文連結：https://weibo.cn/${latestWeibo.link}`;
  const weiboGroup = config['weiboGroup'];
  const weiboRecord = await DB.loadLatestRecord(db);

  for(let i = 0; i < weiboGroup.length; i++){
    const qq = weiboGroup[i].id;
    const type = weiboGroup[i].type;
    if(!weiboRecord || weiboRecord != latestWeibo.id){
      QQ.sendMessage(request, qq, type, content).then((result) => {
        //Only record first time
        if(i === 0){
          DB.saveWeiboRecord(db, latestWeibo.id);
        }
        console.log(result);
      }).catch((err) => {
        console.log(err);
      });
    }
  }
}
