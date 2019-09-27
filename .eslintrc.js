module.exports = {
  env: {
    commonjs: true,
    jest: true
  },
  plugins: ["prettier"],
  extends: ["airbnb-base", "prettier"],
  rules: {
    "prettier/prettier": "error",
    "global-require": "off"
  }
};
