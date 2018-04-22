module.exports = {
  env: {
    es6: true,
    node: true,
  },
  parserOptions: {
    ecmaVersion: 2018,
  },
  plugins: ["node"],
  extends: ["eslint:recommended", "plugin:node/recommended"],
  rules: {
    "node/exports-style": ["error", "module.exports"],
    "no-undef": "error",
    "no-console": 0,
    "no-unused-vars": ["error", { argsIgnorePattern: "^_" }],
  },
};
