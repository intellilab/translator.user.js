import babel from 'rollup-plugin-babel';

export default {
  entry: 'src/translator.user.js',
  dest: 'dist/translator.user.js',
  format: 'iife',
  plugins: [babel({
    presets: [
      ['env', {
        modules: false,
        targets: {
          browsers: ['chrome >= 45'],
        },
      }],
    ],
  })],
};
