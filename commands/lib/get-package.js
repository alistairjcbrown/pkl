const path = require("path");
const util = require("util");
const exec = util.promisify(require("child_process").exec);
const getLerna = require("./get-lerna");

async function getPackagge(monorepoPath, dependency, options) {
  const lernaBin = await getLerna(monorepoPath, options);
  const { stdout } = await exec(`${lernaBin} ls --json`, {
    cwd: monorepoPath
  });

  let packages = [];
  try {
    packages = JSON.parse(stdout);
  } catch (e) {
    return { err: `unable to list packages at ${monorepoPath}` };
  }

  const matchingPackage = packages.find(
    ({ name, location }) =>
      dependency === name ||
      dependency === location.split(path.sep).slice(-1)[0]
  );

  const packageLocation = matchingPackage
    ? matchingPackage.location
    : path.join(monorepoPath, "packages", dependency);
  const packageJsonPath = path.join(packageLocation, "package.json");

  let dependencyPackageJson = {};
  try {
    // eslint-disable-next-line import/no-dynamic-require
    dependencyPackageJson = require(packageJsonPath);
  } catch (e) {
    return { err: `unable to get package.json for ${dependency}` };
  }

  return {
    err: null,
    path: packageLocation,
    packageJson: dependencyPackageJson
  };
}

module.exports = getPackagge;
