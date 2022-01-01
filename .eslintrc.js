module.exports = {
  root: true,
  extends: [
    require.resolve('@gera2ld/plaid/eslint'),
  ],
  env: {
    es2021: true,
  },
  settings: {
    'import/resolver': {
      'babel-module': {},
    },
    react: {
      pragma: 'VM',
    },
  },
  globals: {
    VM: true,
    GM_addStyle: true,
    GM_xmlhttpRequest: true,
    GM_getValue: true,
    GM_setValue: true,
  },
  rules: {
    'react/no-danger': 'off',
  },
};
