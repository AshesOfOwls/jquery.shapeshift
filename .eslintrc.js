module.exports = {
  "extends": "airbnb-base",

  "env": {
    "browser": true
  },

  "globals": {
    "jQuery": false
  },

  "rules": {
    "no-underscore-dangle": ["error", { "allowAfterThis": true }],
    "comma-dangle": ["error", "never"],
    "camelcase": 0,
    "prefer-rest-params": 0,
    "no-param-reassign": ["error", { "props": false }]
  }
};
