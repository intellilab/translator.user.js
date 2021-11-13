module.exports = {
  extends: require.resolve('@gera2ld/plaid/config/babelrc-base'),
  presets: [
    [
      '@babel/preset-react',
      {
        runtime: 'classic',
        pragma: 'VM.h',
        pragmaFrag: 'VM.Fragment',
      },
    ],
  ],
  plugins: [
  ].filter(Boolean),
};
