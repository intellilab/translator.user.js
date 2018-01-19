module.exports = {
  extends: 'airbnb-base',
  env: {
    browser: true,
  },
  plugins: [
    'import'
  ],
  rules: {
    'no-use-before-define': ['error', 'nofunc'],
    'no-mixed-operators': 0,
    'arrow-parens': 0,
    'no-plusplus': 0,
    'no-param-reassign': 0,
    'consistent-return': 0,
    'no-console': ['warn', {
      allow: ['error', 'warn', 'info'],
    }],
  },
  globals: {
    GM_addStyle: true,
    GM_xmlhttpRequest: true,
  },
};
