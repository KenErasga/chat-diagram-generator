module.exports = {
  extends: ['@repo/eslint-config'],
  env: {
    browser: true,
    es2022: true
  },
  parserOptions: {
    ecmaFeatures: { jsx: true }
  }
};
