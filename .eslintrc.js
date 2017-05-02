module.exports = {
  root: true,
  env: {
    browser: true,
  },
  extends: 'airbnb-base',
  globals: {
    GM_addStyle: true,
    GM_xmlhttpRequest: true,
  },
  rules: {
    'arrow-parens': ['off'],
    'no-mixed-operators': ['error', {allowSamePrecedence: true}],
    'no-use-before-define': ['error', 'nofunc'],
  },
};
