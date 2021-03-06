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