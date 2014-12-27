var Express = require('express');
var ExpressBem = require('express-bem');

// create app and bem
var app = Express();
var bem = ExpressBem({
  projectRoot: './',        // bem project root, used for bem make only
  path: './desktop.bundles' // path to your bundles
});

// here to lookup bundles at your path you need small patch
app.bem = bem.bindTo(app);

if (process.env.NODE_ENV !== 'production') {
  bem.usePlugin('express-bem-tools-make', {verbosity: 'debug'});
}

// register engines
bem.usePlugin('express-bem-bemtree'); // requires module express-bem-bemtree
bem.usePlugin('express-bem-bemhtml'); // ... express-bem-bemhtml

bem.engine('fullstack', '.bem', ['.bemhtml.js', '.bemtree.js'], function (name, options, cb) {
  var view = this;

  // pass options.bemjson directly to bemhtml
  if (options.bemjson) return view.thru('bemhtml');

  // return bemjson if requested
  if (options.raw === true) return view.thru('bemtree');

  // full stack
  view.thru('bemtree', name, options, function (err, bemjson) {
    if (err) return cb(err);

    options.bemjson = bemjson;
    view.thru('bemhtml', name, options, function (err, data) {
      if (err) return cb(err);
      cb(null, data);
    });
  });
});

// routes
app.get('/', function (req, res) {
  res.render('index', {
    block : 'page'
  });
});

var server = app.listen(process.env.NODE_PORT || process.env.PORT || 3000, function () {
  var listenOn = server.address();
  console.log('Server listen on ' + listenOn.address + ':' + listenOn.port);
});
