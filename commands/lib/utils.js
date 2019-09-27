/* eslint-disable no-console */

const os = require("os");
const path = require("path");
const fs = require("fs");
const util = require("util");

async function mkdir(filePath) {
  try {
    await util.promisify(fs.mkdir)(filePath);
  } catch (e) {
    if (e.code !== "EEXIST") throw e;
  }
}

async function writeFile(filePath, data) {
  await util.promisify(fs.writeFile)(filePath, JSON.stringify(data, null, 2));
}

async function moveFile(oldPath, newPath) {
  await util.promisify(fs.rename)(oldPath, newPath);
}

function outputError(message, ...context) {
  console.error("error: %s", message);
  [].concat(context).forEach(additionalMessage => {
    console.error(additionalMessage);
  });
  process.exit(1);
}

function outputSuccess(message, ...context) {
  console.log("success: %s", message);
  [].concat(context).forEach(additionalMessage => {
    console.log(additionalMessage);
  });
  process.exit();
}

const getCommandCache = () => path.join(os.homedir(), ".pkl");

const getMappingPath = () =>
  path.join(getCommandCache(), "monorepo-mapping.json");

function getMonorepoMapping() {
  try {
    // eslint-disable-next-line import/no-dynamic-require, global-require
    return require(getMappingPath());
  } catch (e) {
    return {};
  }
}

const splitOutput = value => value.trim().split("\n");

const getLastLine = value => splitOutput(value).slice(-1)[0];

module.exports = {
  mkdir,
  writeFile,
  moveFile,
  outputError,
  outputSuccess,
  getCommandCache,
  getMappingPath,
  getMonorepoMapping,
  splitOutput,
  getLastLine
};
