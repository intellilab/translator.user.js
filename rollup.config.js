import babel from 'rollup-plugin-babel';
import replace from 'rollup-plugin-replace';

const pkg = require('./package.json');

export default {
  entry: 'src/translator.user.js',
  dest: 'dist/translator.user.js',
  format: 'iife',
  plugins: [
    babel({
      presets: [
        ['env', {
          modules: false,
          targets: {
            browsers: ['chrome >= 45'],
          },
        }],
      ],
    }),
    replace({
      VERSION: pkg.version,
    }),
  ],
};
