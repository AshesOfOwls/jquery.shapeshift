module.exports = {
  "extends": "airbnb-base",

  "env": {
    "browser": true
  },

  "rules": {
    "no-underscore-dangle": ["error", {
      "allow": ["_name", "_defaults"]
    }]
  }
};
