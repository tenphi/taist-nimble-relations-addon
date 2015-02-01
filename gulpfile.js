var gulp = require('gulp'),
  concat = require('gulp-concat'),
  wrap = require('gulp-wrap');

gulp.task('scripts', ['templates'], function() {
  //noinspection JSUnresolvedFunction
  return gulp.src('scripts/**/*.js')
    .pipe(concat('addon.js'))
    .pipe(wrap('(function init(){\n\n<%= contents %>\n\n;return { start: start }}).bind(window)'))
    .pipe(gulp.dest('build'));
});

gulp.task('styles', function() {
  return gulp.src('styles/*.css')
    .pipe(concat('addon.css'))
    .pipe(gulp.dest('build'));
});

gulp.task('watch', ['build'], function() {
  gulp.watch('scripts/**/*.js', ['scripts']);
  gulp.watch('styles/**/*.css', ['styles']);
  gulp.watch('templates/**/*.html', ['scripts']);
});

gulp.task('templates', function() {
  return gulp.src('templates/**/*.html')
    .pipe(wrap('var templates; if (!templates) { templates = {}} templates["<%= file.history[0].split("/").slice(-1)[0].split(".")[0] %>"] = \'<%= contents.toString().split("\\n").join("").split("\'").join("\\\\\\\'") %>\'; '))
    .pipe(concat('templates.js'))
    .pipe(gulp.dest('scripts'));
});

gulp.task('build', ['styles', 'scripts']);

gulp.task('default', ['build']);