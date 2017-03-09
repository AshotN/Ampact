var gulp = require('gulp');
var stylus = require('gulp-stylus');
var watch = require('gulp-watch');
var cleanCSS = require('gulp-clean-css');
var Couleurs = require('couleurs'); Couleurs.proto();
var size = require('gulp-filesize');
var gulpif = require('gulp-if');

var production = false;

var paths = {
  stylusWatch: 'src/stylus/**/*.styl',
  stylusEntry: 'src/stylus/index.styl',
  css: 'src/',
};


gulp.task('stylus-compile' , function() {
  console.log("Compiling Stylus".fg(0, 255, 0));
  return gulp.src(paths.stylusEntry)
    .pipe(stylus())
    .pipe(gulpif(production, cleanCSS({debug: true}, function(details) {
      console.log(details.name + ': ' + details.stats.originalSize);
      console.log(details.name + ': ' + details.stats.minifiedSize);
    })))
    .pipe(gulp.dest(paths.css))
    .pipe(size())
    .on('error', errorHandle);
});



gulp.task('watch' ,function() {

  gulp.watch(paths.stylusWatch, ['stylus-compile']);
});

gulp.task('default', ['watch', 'stylus-compile']);


function errorHandle(error)
{
  console.log("Error:"+error.toString().fg(255,0,0));
  this.emit('end');
}
