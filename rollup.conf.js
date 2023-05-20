const path = require('path');
const { getRollupPlugins } = require('@gera2ld/plaid');
const userscript = require('rollup-plugin-userscript');
const pkg = require('./package.json');

const DIST = 'dist';
const FILENAME = 'translator';

const bundleOptions = {
  extend: true,
  esModule: false,
};
const postcssOptions = {
  ...require('@gera2ld/plaid/config/postcssrc'),
  inject: false,
  minimize: true,
  modules: {
    generateScopedName: "tr_[local]_[hash:base64:5]",
  },
};
const rollupConfig = [
  {
    input: {
      input: 'src/index.tsx',
      plugins: [
        ...getRollupPlugins({
          esm: true,
          postcss: postcssOptions,
          minimize: false,
        }),
        userscript(
          path.resolve('src/meta.js'),
          meta => meta
            .replace('process.env.VERSION', pkg.version)
            .replace('process.env.AUTHOR', pkg.author),
        ),
      ],
      external: [/^@violentmonkey\//],
    },
    output: {
      format: 'iife',
      file: `${DIST}/${FILENAME}.user.js`,
      globals: {
        '@violentmonkey/dom': 'VM',
        '@violentmonkey/ui': 'VM',
      },
      ...bundleOptions,
    },
  },
];

rollupConfig.forEach((item) => {
  item.output = {
    indent: false,
    // If set to false, circular dependencies and live bindings for external imports won't work
    externalLiveBindings: false,
    ...item.output,
  };
});

module.exports = rollupConfig.map(({ input, output }) => ({
  ...input,
  output,
}));
