const util = require("util");
const path = require("path");
const exec = util.promisify(require("child_process").exec);
const { getLastLine } = require("./utils");

async function checkLocalWithYarn(monorepoPath) {
  const { stdout } = await exec("yarn list --depth=0 --pattern=lerna --json", {
    cwd: monorepoPath
  });

  const matches = JSON.parse(getLastLine(stdout));
  return matches.data.trees.some(({ name }) => name.startsWith("lerna@"));
}

async function checkLocalWithNpm(monorepoPath) {
  const { stdout } = await exec("npm ls lerna --json", {
    cwd: monorepoPath
  });

  const localLerna = JSON.parse(stdout);
  return !!(
    localLerna &&
    localLerna.dependencies &&
    localLerna.dependencies.lerna
  );
}

async function getLerna(monorepoPath, options) {
  const isLocal = options.yarn
    ? await checkLocalWithYarn(monorepoPath)
    : await checkLocalWithNpm(monorepoPath);
  if (isLocal) {
    return path.join("node_modules", ".bin", "lerna");
  }

  return "lerna";
}

module.exports = getLerna;
