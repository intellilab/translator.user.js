const path = require('path');
const gulp = require('gulp');
const log = require('fancy-log');
const rollup = require('rollup');
const del = require('del');
const babel = require('rollup-plugin-babel');
const replace = require('rollup-plugin-replace');
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

const commonConfig = {
  input: {
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
      babel({
        exclude: 'node_modules/**',
        externalHelpers: true,
      }),
      replace({ values }),
    ],
  },
};
const rollupConfig = [
  {
    input: {
      ...commonConfig.input,
      input: 'src/index.js',
    },
    output: {
      ...commonConfig.output,
      format: 'cjs',
      file: `${DIST}/translator.user.js`,
    },
  },
];

function clean() {
  return del(DIST);
}

function buildJs() {
  return Promise.all(rollupConfig.map(config => {
    return rollup.rollup(config.input)
    .then(bundle => bundle.write(config.output))
    .catch(err => {
      log(err.toString());
    });
  }));
}

function watch() {
  gulp.watch('src/**', buildJs);
}

exports.clean = clean;
exports.build = buildJs;
exports.dev = gulp.series(buildJs, watch);
