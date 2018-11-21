/**
 * Created by rayde on 11/1/2017.
 */
const gulp = require('gulp');
const plugins = require('gulp-load-plugins')();
const browserify = require('browserify');
const watchify = require('watchify');
const babelify = require('babelify');
const source = require('vinyl-source-stream');
const babel = require('gulp-babel');
const uglify = require('gulp-uglify');
const buffer = require('vinyl-buffer');
const livereload = require('gulp-livereload')


const browser_js_path = './static/js/app.js';

let sass_paths = ['node_modules/materialize-css/sass'];

gulp.task('materialize', function () {
    gulp.src('node_modules/materialize-css/dist/js/materialize.min.js')
        .pipe(gulp.dest('static/bin'));
    gulp.src('node_modules/jquery/dist/jquery.min.js')
        .pipe(gulp.dest('static/bin'));
    gulp.src('./node_modules/materialize-css/dist/fonts/**', {
        base: './node_modules/materialize-css/dist/'
    }).pipe(gulp.dest('static/fonts'));
});

gulp.task('fetch', function(){
    gulp.src('node_modules/whatwg-fetch/fetch.js')
    .pipe(gulp.dest('static/bin'))
})


gulp.task('sass', function(){
    return gulp.src('static/scss/app.scss')
        .pipe(plugins.sass({
            includePaths: sass_paths
        })
            .on('error', plugins.sass.logError))
        .pipe(plugins.autoprefixer({
            browsers: ['last 2 versions', 'ie >= 9']
        }))
        .pipe(gulp.dest('static/bin'))
        .pipe(livereload());
});

// Add react.
gulp.task('browser_js', function(){
    if(process.env.ENV === 'PROD'){
        browserify(browser_js_path)
            .transform(babelify, {
                "presets": ["es2015", "stage-2", "react"]
            })
            .bundle().on('error', function (error) {
            console.log(error.toString());
        })
            .pipe(source('bundle.js'))
            .pipe(buffer())
            .pipe(uglify())
            .pipe(gulp.dest('static/bin'));
    }
    else {
        browserify(browser_js_path)
            .transform(babelify, {
                "presets": ["es2015", "stage-2", "react"]
            })
            .bundle().on('error', function (error) {
            console.log(error.toString());
        })
            .pipe(source('bundle.js'))
            .pipe(gulp.dest('static/bin'))
            .pipe(livereload());
    }

});


gulp.task('watch', function(){
    livereload.listen()
    gulp.watch(['static/**/*.scss'], ['sass']);
    gulp.watch(['static/**/*.js', '!static/bin/*.js'], ['browser_js']);
    //gulp.watch(['!static/img/*'], ['img']);
});

gulp.task('default', ['watch', 'materialize', 'sass', 'browser_js', 'fetch']);