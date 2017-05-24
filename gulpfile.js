// Imports
var gulp = require('gulp');
var clean = require('gulp-clean');
var ts = require('gulp-typescript');
var rename = require("gulp-rename");
var sequence = require('run-sequence');

// Compiles typescript files
gulp.task('compile:ts', function () {
    return gulp
        .src(["./src/**/*.ts"], { base: './src' })
        .pipe(ts({ module: 'commonjs', target: 'es6', noImplicitAny: false }))
        .pipe(gulp.dest('./dist'));
});

// Removes compiled js files
gulp.task('clean', function () {
    return gulp
        .src([
            './dist/**/*.js'
        ], { read: false })
        .pipe(clean())
});


// Copies 'package.json' file to build directory
gulp.task('copy:package.json', function () {
    return gulp
        .src('./package.json')
        .pipe(gulp.dest('./dist'));
});

gulp.task('build', function (done) {
    sequence('clean', 'compile:ts', 'copy:package.json', 'rename:config', done);
});

gulp.task('build:dev', function (done) {
    sequence('clean', 'compile:ts', 'copy:package.json', done);
});
