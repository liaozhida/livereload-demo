编写一个项目，能够支持修改了文件浏览器自动刷新的程序，减少F5操作，提升编程效率

项目主要做了三件事情

- 监控文件的变化
- 有变化发送消息给所有的客户端
- 触发浏览器重载

需要引用的依赖

- express:简单的服务器
- watch:检查文件的变动
- sendevent:
- ejs:模版引擎
- uglify-js:压缩文件

index.js
```javaScript
var express = require('express');
var app = express();
var ejs = require('ejs');
var path = require('path');
var reloadify = require('./lib/reloadify');

var PORT = process.env.PORT || 1337;

app.engine('html', ejs.renderFile);
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'html');
reloadify(app, __dirname + '/views');

app.get('/', function(req, res) {
	res.render('home');
});

app.listen(PORT);
console.log('server started on port %s', PORT);
```

reloadify.js
```javaScript
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
```

client-script.js
```javaScript
(function() {

  function subscribe(url, callback) {
    var source = new window.EventSource(url);

    source.onmessage = function(e) {
      callback(e.data);
    };

    source.onerror = function(e) {
      if (source.readyState == window.EventSource.CLOSED) return;

      console.log('sse error', e);
    };

    return source.close.bind(source);
  }

  // 监听/eventstream发送的消息，然后刷新浏览器
  subscribe('/eventstream', function(data) {
    if (data && /reload/.test(data)) {
      window.location.reload();
    }
  });

}());
```
home.html
```Markup
<html>
	<body>
		<h1>hello wolrd! lovely1</h1>
		 <%- watchScript  %>
	</body>
</html>
```

dev.sh
```powerShell
#!/bin/bash
NODE_ENV=development PORT=1337 supervisor index.js
```
启动程序 ./bin/dev.sh
修改home.html的内容 ，观察浏览器的变化



参考网址:
https://www.npmjs.com/package/sendevent
https://www.airpair.com/node.js/posts/top-10-mistakes-node-developers-make
