const cheerio = require('cheerio');
const Weibo = {
  fetchFF(request, config){
    const cookie = config['weiboCookie'];
    return new Promise((resolve, reject) => {
      request({
        method: 'GET',
        headers:{
          'Cookie': cookie,
          'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X x.y; rv:42.0) Gecko/20100101 Firefox/42.0'
        },
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
    $('div[class="c"]').each(function(i,e){
      if(i == 0 && $(e).attr('id')){
        const weiboIdRegax = /M_(.*)/;
        const id = weiboIdRegax.exec($(e).attr('id'))[1];
        const content = $('div[id="' + $(e).attr('id') + '"]').find($('span.ctt')).text();
        const link = $('div[id="' + $(e).attr('id') + '"]').find($('a:last-child')).attr('href');
        weibo = {
          id,
          content,
          link,
        }
      }
    });
    return weibo;
  },
};
module.exports = Weibo;
