var gulp          = require('gulp')
var sourcemaps    = require('gulp-sourcemaps')
var uglify        = require('gulp-uglify')
var browserify    = require('browserify')
var watchify      = require('watchify')
var babel         = require('babelify')
var source        = require('vinyl-source-stream')
var buffer        = require('vinyl-buffer')

function compile(watch) {
    var bundler = watchify(browserify('./src/app.js', { debug: true }).transform(babel))

    function rebundle() {
        bundler.bundle()
            .on('error', function(err) { console.error(err) ; this.emit('end') })
            .pipe(source('app.js'))
            .pipe(buffer())
            .pipe(uglify())
            .pipe(sourcemaps.init({ loadMaps: true }))
            .pipe(sourcemaps.write('./'))
            .pipe(gulp.dest('./dist'))
    }

    if(watch) {
        bundler.on('update', function() {
            console.log('You have fed the beast')
            rebundle()
        })
    }

    rebundle()
}

function watch() {
    return compile(true)
}

gulp.task('build', function() { return compile() })
gulp.task('watch', function() { return watch() })

gulp.task('default', ['watch'])
