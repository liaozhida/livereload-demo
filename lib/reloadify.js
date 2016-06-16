var sendevent = require('sendevent');
var watch = require('watch');
var uglify = require('uglify-js');
var fs = require('fs');
var ENV = process.env.NODE_ENV || 'development';
var path = require('path');

var clientScript = fs.readFileSync( path.resolve('./') + '/asset/client-script.js', 'utf8');
var script = uglify.minify(clientScript, { fromString: true }).code;

function reloadify(app, dir) {

  //不是开发环境不生效
  if (ENV !== 'development') {
    app.locals.watchScript = '';
    return;
  }

  //创建一个/eventstream事件, 用于发送消息
  var events = sendevent('/eventstream');
  console.info(ENV+" sis env");

  app.use(events);

  //检测文件是否发生变化 有就发送消息
  watch.watchTree(dir, function (f, curr, prev) {
    events.broadcast({ msg: 'reload' });
  });

  // 声明一个变量，以供前端嵌入 js 代码
  app.locals.watchScript = '<script>' + script + '</script>';
}

module.exports = reloadify;