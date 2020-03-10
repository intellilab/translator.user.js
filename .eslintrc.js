module.exports = {
  root: true,
  extends: [
    require.resolve('@gera2ld/plaid/eslint'),
    require.resolve('@gera2ld/plaid-common-react/eslint'),
  ],
  settings: {
    'import/resolver': {
      'babel-module': {},
    },
  },
  globals: {
    VM: true,
    GM_xmlhttpRequest: true,
  },
  rules: {
    'react/no-danger': 'off',
  },
};
