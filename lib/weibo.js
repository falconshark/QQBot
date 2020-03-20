const cheerio = require('cheerio');
const Weibo = {
  fetchFF(request, config){
    const cookie = config['weiboCookie'];
    return new Promise((resolve, reject) => {
      request({
        method: 'GET',
        headers:{
          'Cookie': cookie,
          'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10.14; rv:72.0) Gecko/20100101 Firefox/72.0'
        },
        followAllRedirects: true,
        uri:'https://weibo.cn/u/1797798792',
      }, function(err, res, body){
        if(err){
          console.log(err);
          return;
        }
        switch(res.statusCode){
          case 200:
          resolve(body);
          break;

          default:
          const error = {
            'status': res.statusCode,
          };
          reject(error);
        }
      });
    });
  },
  parseFF(body){
    $ = cheerio.load(body);
    let weibo = {};
    const htmlList = $('div[class="c"]');
    const firstWeibo = $(htmlList[0]);
    //忽略置頂微博
    if(firstWeibo.find($('span.kt')).length === 0){
      weibo = this._parseFF(firstWeibo);
    }else{
      const nextWeibo = $(htmlList[1]);
      weibo = this._parseFF(nextWeibo);
    }
    return weibo;
  },
  _parseFF(weibo){
    const weiboIdRegax = /M_(.*)/;
    const subContentRegax = /转发理由:([^赞]+)/;
    const id = weiboIdRegax.exec(weibo.attr('id'))[1];
    let content = weibo.find($('span.ctt')).text();
    const subContent = weibo.find($('div:last-child')).text();
    const link = weibo.find($('a:last-child')).attr('href');

    if(subContentRegax.exec(subContent)){
      content = subContentRegax.exec(subContent)[1] + '\n' + content;
    }
    const fullWeibo = {
      id,
      content,
      link,
    }
    console.log(fullWeibo);
    return fullWeibo;
  }
};
module.exports = Weibo;
