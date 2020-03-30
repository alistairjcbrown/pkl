const util = require("util");
const path = require("path");
const exec = util.promisify(require("child_process").exec);
const { splitOutput } = require("./utils");

async function installWthYarn(projectPath, installPath) {
  const { stderr, stdout } = await exec(
    `yarn add file:${path.relative(projectPath, installPath)}`,
    {
      cwd: projectPath,
    }
  );

  const errors = splitOutput(stderr).filter(
    (line) => !line.trim().startsWith("warning ")
  );

  return {
    isError: errors.length > 0,
    stdout,
    stderr,
  };
}

async function installWithNpm(projectPath, installPath) {
  const { stderr, stdout } = await exec(
    `npm install ${path.relative(projectPath, installPath)}`,
    {
      cwd: projectPath,
    }
  );

  const errors = splitOutput(stderr).filter(
    (line) => !line.trim().startsWith("npm WARN")
  );

  return {
    isError: errors.length > 0,
    stdout,
    stderr,
  };
}

async function install(projectPath, installPath, options) {
  if (options.yarn) {
    return installWthYarn(projectPath, installPath);
  }
  return installWithNpm(projectPath, installPath);
}

module.exports = install;
