var fs = require('fs');
var browserify = require('browserify');

var bfy = browserify({
  'entries': ['./app/main.js'],
  'cache': {},
  'packageCache': {},
  'debug': true,
  'plugin': ['watchify']
});

const bundle = () => {
  console.log('Start bundling...');
  bfy.transform('babelify', {'presets': ['es2016']}).
    transform({'global': true}, 'uglifyify').
    bundle().
    pipe(fs.createWriteStream('./public/lib/js/app.js'));
  console.log('...and finishing it!');
};

bfy.on('update', bundle);
bundle();
