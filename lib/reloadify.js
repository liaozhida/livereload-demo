var sendevent = require('sendevent');
var watch = require('watch');
var uglify = require('uglify-js');
var fs = require('fs');
var ENV = process.env.NODE_ENV || 'development';
var path = require('path');

// create && minify static JS code to be included in the page
var polyfill = fs.readFileSync( path.resolve('./') + '/asset/eventsource-polyfill.js', 'utf8');
var clientScript = fs.readFileSync( path.resolve('./') + '/asset/client-script.js', 'utf8');
var script = uglify.minify(polyfill + clientScript, { fromString: true }).code;

function reloadify(app, dir) {

  if (ENV !== 'development') {
    app.locals.watchScript = '';
    return;
  }

  // create a middlware that handles requests to `/eventstream`
  var events = sendevent('/eventstream');

  app.use(events);

  watch.watchTree(dir, function (f, curr, prev) {
    events.broadcast({ msg: 'reload' });
  });

  // assign the script to a local var so it's accessible in the view
  app.locals.watchScript = '<script>' + script + '</script>';
}

module.exports = reloadify;