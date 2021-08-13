const fs = require('fs');
const { getRollupPlugins } = require('@gera2ld/plaid');
const pkg = require('./package.json');

const DIST = 'dist';
const FILENAME = 'translator';
const BANNER = fs.readFileSync('src/meta.js', 'utf8')
.replace('process.env.VERSION', pkg.version);

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
      input: 'src/index.js',
      plugins: getRollupPlugins({
        esm: true,
        postcss: postcssOptions,
        minimize: false,
      }),
    },
    output: {
      format: 'iife',
      file: `${DIST}/${FILENAME}.user.js`,
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
    ...BANNER && {
      banner: BANNER,
    },
  };
});

module.exports = rollupConfig.map(({ input, output }) => ({
  ...input,
  output,
}));
