module.exports = {
  env: {
    browser: true,
    es6: true,
  },
  extends: [
    'airbnb',
  ],
  globals: {
    Atomics: 'readonly',
    SharedArrayBuffer: 'readonly',
  },
  parserOptions: {
    ecmaFeatures: {
      jsx: true,
    },
    ecmaVersion: 2018,
    sourceType: 'module',
  },
  plugins: [
    'react',
  ],
  rules: {
    "indent": [
      "error",
      4
    ],
    "react/jsx-indent": [
      "error",
      4
    ],
    "react/jsx-indent-props": [
      "error",
      4
    ],
    "react/jsx-filename-extension": "off",
    "react/forbid-prop-types": "off",
    "react/jsx-props-no-spreading": "off",
  },
};
