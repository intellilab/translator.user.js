const path = require('path');
const gulp = require('gulp');
const log = require('fancy-log');
const rollup = require('rollup');
const del = require('del');
const { getRollupPlugins, getExternal } = require('./scripts/util');

const DIST = 'dist';

const rollupConfig = [
  {
    input: {
      input: 'src/index.js',
      plugins: getRollupPlugins({ browser: true }),
    },
    output: {
      format: 'iife',
      file: `${DIST}/translator.user.js`,
      name: 'translator',
    },
  },
];

function clean() {
  return del(DIST);
}

function buildJs() {
  return Promise.all(rollupConfig.map(config => {
    return rollup.rollup(config.input)
    .then(bundle => bundle.write(config.output));
  }));
}

function wrapError(handle) {
  const wrapped = () => handle()
  .catch(err => {
    log(err.toString());
  });
  wrapped.displayName = handle.name;
  return wrapped;
}

function watch() {
  gulp.watch('src/**', safeBuildJs);
}

const safeBuildJs = wrapError(buildJs);

exports.clean = clean;
exports.build = buildJs;
exports.dev = gulp.series(safeBuildJs, watch);
