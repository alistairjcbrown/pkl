const util = require("util");
const path = require("path");
const exec = util.promisify(require("child_process").exec);
const getLerna = require("./get-lerna");
const { moveFile, writeFile, getLastLine } = require("./utils");

async function packWithYarn(dependencyPackageJson, lernaBin, monorepoPath) {
  const { stdout, stderr } = await exec(
    `${lernaBin} exec --scope ${dependencyPackageJson.name} -- yarn pack --json`,
    { cwd: monorepoPath }
  );

  let packOutput = "";
  try {
    packOutput = JSON.parse(getLastLine(stdout)).data;
  } catch (e) {
    // noop
  }

  const tarPath = packOutput.match('Wrote tarball to "([^"]+)"');

  return {
    stdout,
    stderr,
    file: tarPath ? path.basename(tarPath[1]) : ""
  };
}

async function packWithNpm(dependencyPackageJson, lernaBin, monorepoPath) {
  const { stdout, stderr } = await exec(
    `${lernaBin} exec --scope ${dependencyPackageJson.name} -- npm pack`,
    { cwd: monorepoPath }
  );

  return {
    stdout,
    stderr,
    file: getLastLine(stdout)
  };
}

async function pack(monorepoPath, depedencyPath, options) {
  const packageJsonPath = path.join(depedencyPath, "package.json");
  // eslint-disable-next-line import/no-dynamic-require
  const dependencyPackageJson = require(packageJsonPath);
  const isUnversioned = !dependencyPackageJson.version;
  const packageBackupPath = path.join(depedencyPath, "package.json.pkl_backup");

  if (isUnversioned) {
    await moveFile(packageJsonPath, packageBackupPath);
    await writeFile(packageJsonPath, {
      ...dependencyPackageJson,
      version: "0.0.0"
    });
  }

  const lernaBin = await getLerna(monorepoPath, options);
  const { stdout, stderr, file } = options.yarn
    ? await packWithYarn(dependencyPackageJson, lernaBin, monorepoPath)
    : await packWithNpm(dependencyPackageJson, lernaBin, monorepoPath);

  if (isUnversioned) {
    await moveFile(packageBackupPath, packageJsonPath);
  }

  return {
    isError: !getLastLine(stderr).includes("success exec"),
    stdout,
    stderr,
    file
  };
}

module.exports = pack;
