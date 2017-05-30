// Imports
var gulp = require('gulp');
var clean = require('gulp-clean');
var ts = require('gulp-typescript');
var sequence = require('run-sequence');
var argv = require('yargs').argv;

// Compiles typescript files
gulp.task('compile:ts', function () {
    return gulp
        .src(["./src/**/*.ts"], { base: './src' })
        .pipe(ts({ module: 'commonjs', target: 'es6', declaration: true, noImplicitAny: false }))
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


gulp.task('build', function (done) {
    sequence('clean', 'compile:ts', done);
});

gulp.task('build:dev', function (done) {
    sequence('clean', 'compile:ts', done);
});

