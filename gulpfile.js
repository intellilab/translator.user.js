const gulp = require('gulp');
const babel = require('gulp-babel');
const replace = require('gulp-replace');
const postcss = require('gulp-postcss');
const rename = require('gulp-rename');
const precss = require('precss');
const cssModules = require('postcss-modules');

const pkg = require('./package.json');
const data = {
  VERSION: pkg.version,
};
const plugins = [
  precss(),
  cssModules({
    getJSON(filename, json) {
      data.STYLES = JSON.stringify(json);
    },
  }),
];

gulp.task('css', () => {
  const stream = gulp.src('src/style.css')
  .pipe(postcss(plugins));
  stream.on('data', file => {
    data.CSS = JSON.stringify(file.contents.toString());
  });
  return stream;
});

gulp.task('js', ['css'], () => {
  return gulp.src('src/app.js')
  .pipe(babel({
    presets: [
      ['env', {
        targets: {
          browsers: ['chrome >= 45'],
        },
      }],
    ],
  }))
  .pipe(replace(/process\.env\.(\w+)/g, (m, key) => data[key] || null))
  .pipe(rename('translator.user.js'))
  .pipe(gulp.dest('dist'));
});

gulp.task('build', ['js']);

gulp.task('watch', ['build'], () => {
  gulp.watch('src/**', ['js']);
});
