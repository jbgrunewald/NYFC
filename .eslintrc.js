module.exports = {
  env: {
    es6: true,
  },
  extends: [
    "airbnb",
    "plugin:jest/recommended",
  ],
  globals: {
    Atomics: 'readonly',
    SharedArrayBuffer: 'readonly',
  },
  parserOptions: {
    ecmaVersion: 2018,
    sourceType: 'module',
  },
  rules: {
  },
  plugins: ['jest']
};
