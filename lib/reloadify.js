var sendevent = require('sendevent');
var watch = require('watch');
var uglify = require('uglify-js');
var fs = require('fs');
var ENV = process.env.NODE_ENV || 'development';
var path = require('path');

var clientScript = fs.readFileSync( path.resolve('./') + '/asset/client-script.js', 'utf8');
var script = uglify.minify(clientScript, { fromString: true }).code;

function reloadify(app, dir) {

  if (ENV !== 'development') {
    app.locals.watchScript = '';
    return;
  }

  // create a middlware that handles requests to `/eventstream`
  var events = sendevent('/eventstream');
  console.info(ENV+" sis env");

  app.use(events);

  watch.watchTree(dir, function (f, curr, prev) {
    events.broadcast({ msg: 'reload' });
  });

  // assign the script to a local var so it's accessible in the view
  app.locals.watchScript = '<script>' + script + '</script>';
}

module.exports = reloadify;