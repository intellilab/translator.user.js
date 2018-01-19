const path = require('path');
const gulp = require('gulp');
const log = require('fancy-log');
const eslint = require('gulp-eslint');
const rollup = require('rollup');
const postcss = require('postcss');
const autoprefixer = require('autoprefixer');
const precss = require('precss');
const cssModules = require('postcss-modules');
const cssnano = require('cssnano');
const pkg = require('./package.json');

const DIST = 'dist';
const IS_PROD = process.env.NODE_ENV === 'production';
const USE_CSS_MODULES = true;
const values = {
  'process.env.VERSION': pkg.version,
  'process.env.NODE_ENV': process.env.NODE_ENV || 'development',
};

const cssExportMap = {};
const postcssPlugins = [
  precss(),
  autoprefixer(),
  USE_CSS_MODULES && cssModules({
    getJSON(id, json) {
      cssExportMap[id] = json;
    },
  }),
  IS_PROD && cssnano(),
].filter(Boolean);

const rollupOptions = {
  plugins: [
    {
      transform(code, id) {
        if (path.extname(id) !== '.css') return;
        return postcss(postcssPlugins).process(code, { from: id })
        .then(result => {
          const classMap = cssExportMap[id];
          return [
            `export const css = ${JSON.stringify(result.css)};`,
            classMap && `export const classMap = ${JSON.stringify(classMap)};`,
          ].filter(Boolean).join('\n');
        });
      },
    },
    require('rollup-plugin-babel')({
      runtimeHelpers: true,
      exclude: 'node_modules/**',
    }),
    require('rollup-plugin-replace')({ values }),
  ],
};

function buildJs() {
  return rollup.rollup(Object.assign({
    input: 'src/index.js',
  }, rollupOptions))
  .then(bundle => bundle.write({
    file: `${DIST}/translator.user.js`,
    format: 'cjs',
  }))
  .catch(err => {
    log(err.toString());
  });
}

function lint() {
  return gulp.src('src/**/*.js')
  .pipe(eslint())
  .pipe(eslint.format())
  .pipe(eslint.failAfterError());
}

function watch() {
  gulp.watch('src/**', buildJs);
}

exports.lint = lint;
exports.build = buildJs;
exports.watch = gulp.series(buildJs, watch);
