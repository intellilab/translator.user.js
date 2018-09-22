const fs = require('fs');
const path = require('path');
const babel = require('rollup-plugin-babel');
const replace = require('rollup-plugin-replace');
const resolve = require('rollup-plugin-node-resolve');
const commonjs = require('rollup-plugin-commonjs');
const postcss = require('postcss');
const autoprefixer = require('autoprefixer');
const precss = require('precss');
const cssModules = require('postcss-modules');
const cssnano = require('cssnano');
const pkg = require('../package.json');

const IS_PROD = process.env.NODE_ENV === 'production';
const values = {
  'process.env.VERSION': pkg.version,
  'process.env.NODE_ENV': process.env.NODE_ENV || 'development',
};

const postcssPluginMap = {
  precss: () => precss(),
  autoprefixer: () => autoprefixer(),
  cssModules: ({ cssMap }) => cssModules({
    getJSON(id, json) {
      cssMap[id] = json;
    },
  }),
  cssnano: () => cssnano(),
};
const postcssPlugins = {
  css: getPostcssPlugins(),
  cssModules: getPostcssPlugins({ cssModules: true }),
};
const rollupPluginMap = {
  css: () => cssPlugin(),
  babel: ({ babelConfig, browser }) => babel({
    ...browser ? {
      // Combine all helpers at the top of the bundle
      externalHelpers: true,
    } : {
      // Require helpers from '@babel/runtime'
      runtimeHelpers: true,
      plugins: [
        '@babel/plugin-transform-runtime',
      ],
    },
    exclude: 'node_modules/**',
    ...babelConfig,
  }),
  replace: () => replace({ values }),
  resolve: () => resolve(),
  commonjs: () => commonjs(),
};

exports.getRollupPlugins = getRollupPlugins;
exports.getExternal = getExternal;

function getPostcssPlugins({ cssModules } = {}) {
  return [
    postcssPluginMap.precss(),
    postcssPluginMap.autoprefixer(),
    cssModules && postcssPluginMap.cssModules(cssModules),
    IS_PROD && postcssPluginMap.cssnano(),
  ].filter(Boolean);
}

function cssPlugin() {
  const cssMap = {};
  const postcssPlugins = {
    css: getPostcssPlugins(),
    cssModules: getPostcssPlugins({ cssModules: { cssMap } }),
  };
  return {
    name: 'CSSPlugin',
    resolveId(importee, importer) {
      if (importee.endsWith('.css')) {
        return path.resolve(path.dirname(importer), `${importee}.js`);
      }
    },
    load(id) {
      if (id.endsWith('.css.js')) {
        return new Promise((resolve, reject) => {
          fs.readFile(id.slice(0, -3), 'utf8', (err, data) => {
            if (err) reject(err);
            else resolve(data);
          });
        });
      }
    },
    transform(code, id) {
      let plugins;
      const filename = id.slice(0, -3);
      if (filename.endsWith('.module.css')) {
        plugins = postcssPlugins.cssModules;
      } else if (filename.endsWith('.css')) {
        plugins = postcssPlugins.css;
      }
      if (plugins) {
        return postcss(plugins).process(code, { from: filename })
        .then(result => {
          const classMap = cssMap[filename];
          return [
            `export const css = ${JSON.stringify(result.css)};`,
            classMap && `export const classMap = ${JSON.stringify(classMap)};`,
          ].filter(Boolean).join('\n');
        });
      }
    },
  };
}

function getRollupPlugins({ babelConfig, browser } = {}) {
  return [
    rollupPluginMap.css(),
    rollupPluginMap.babel({ babelConfig, browser }),
    rollupPluginMap.replace(),
    rollupPluginMap.resolve(),
    rollupPluginMap.commonjs(),
  ];
}

function getExternal(externals = []) {
  return id => id.startsWith('@babel/runtime/') || externals.includes(id);
}
