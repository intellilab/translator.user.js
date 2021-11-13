module.exports = {
  root: true,
  extends: [
    require.resolve('@gera2ld/plaid/eslint'),
    'plugin:prettier/recommended',
  ],
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
