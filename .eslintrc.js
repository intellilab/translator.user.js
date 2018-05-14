module.exports = {
  extends: 'airbnb-base',
  parser: 'babel-eslint',
  parserOptions: {
    sourceType: 'module'
  },
  env: {
    browser: true,
  },
  plugins: [
    'import',
    'react',
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
    'no-bitwise': ['error', { int32Hint: true }],
    'no-restricted-syntax': 'off',
    'react/jsx-uses-react': 'error',
  },
  globals: {
    VM: true,
    GM_addStyle: true,
    GM_xmlhttpRequest: true,
  },
  settings: {
    react: {
      pragma: 'h',
    },
  },
};
