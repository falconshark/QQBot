const cheerio = require('cheerio');
const iconv = require('iconv-lite');
const NGA = {
  fetchPartys(request, config){
    const cookie = config['ngaCookie'];
    return new Promise((resolve, reject) => {
      request({
        method: 'GET',
        encoding:null,
        headers:{
          'Cookie': cookie,
          'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X x.y; rv:42.0) Gecko/20100101 Firefox/42.0',
        },
        uri:'https://bbs.nga.cn/thread.php?fid=592',
      }, function(err, res, body){
        if(err){
          console.log(err);
          return;
        }
        switch(res.statusCode){
          case 200:
          const html = iconv.decode(body, 'GBK');
          resolve(html);
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
  parsePartys(body, area, job, instance){
    $ = cheerio.load(html, {decodeEntities: false});
    const areaRegax = new RegExp(`\[(${area})区\](.*$)`);
    const jobRegax = new RegExp(`(^$job{}$)`);
    $('a[class="topic"]').each(function(i,e){
      const title = $(e).text();
      const area = areaRegax.exec(title);
    });
    return partys;
  },
};
module.exports = NGA;
