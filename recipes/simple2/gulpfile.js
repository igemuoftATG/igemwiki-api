
const gulp = require('gulp')
const concat = require('gulp-concat')
const cssmin = require('gulp-cssmin')
const gutil = require('gulp-util')
const uglify = require('gulp-uglify')

const mainBowerFiles = require('main-bower-files')

const dests = {
  js: './dist/js',
  css: './dist/css'
}

gulp.task('bower:js', () => gulp
  .src(mainBowerFiles('**/*.js'), { base: './bower_components' })
  .pipe(concat('vendor.js'))
  .pipe(uglify().on('error', gutil.log))
  // .pipe(header(headerCreator('js')))
  .pipe(gulp.dest(dests.js))
)

gulp.task('bower:css', () => gulp
  .src(mainBowerFiles('**/*.css'), { base: './bower_components' })
  .pipe(concat('vendor.css'))
  .pipe(cssmin())
  // .pipe(header(headerCreator('css')))
  .pipe(gulp.dest(dests.css))
)
