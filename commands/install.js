#!/usr/bin/env node

/* eslint-disable no-await-in-loop */
const path = require("path");
const program = require("commander");
const ora = require("ora");
const packDependency = require("./lib/pack");
const installDependency = require("./lib/install");
const getPackage = require("./lib/get-package");
const {
  getMonorepoMapping,
  outputError,
  outputSuccess,
  mkdir,
  moveFile,
} = require("./lib/utils");

(async function install() {
  program
    .name("pkl-install")
    .usage("<monorepo-name> <package-name> [options]")
    .description(
      `
Installs the named packages from the named monorepo, into the project where the
command is run. Packages can be referenced by their name (as listed in the \`name\`
field of their corresponding \`package.json\` file) or by their folder name.
Multiple packages can be listed to install more than one in a single command.
`.trim()
    )
    .option("--yarn", "use yarn instead of npm");

  program.parse(process.argv);
  const [monorepo, ...dependencies] = program.args;

  if (!monorepo) {
    return program.missingArgument("monorepo");
  }

  if (dependencies.length === 0) {
    return program.missingArgument("dependency");
  }

  const monorepoPath = getMonorepoMapping()[monorepo];
  if (!monorepoPath) {
    return outputError("unknown monorepo name");
  }

  const dependencyPackages = {};
  // eslint-disable-next-line no-restricted-syntax
  for (const dependency of dependencies) {
    const progress = ora(`${dependency} - finding...`).start();

    const {
      err: packageErr,
      path: depedencyPath,
      packageJson: dependencyPackageJson,
    } = await getPackage(monorepoPath, dependency, { yarn: program.yarn });

    if (packageErr) {
      progress.fail(`${dependency} - error`);
      return outputError(packageErr);
    }

    dependencyPackages[dependency] = dependencyPackageJson;

    progress.text = `${dependency} - packing...`;
    const {
      isError: isPackError,
      stderr: packErr,
      file: packedFileName,
    } = await packDependency(monorepoPath, depedencyPath, {
      yarn: program.yarn,
    });

    if (isPackError) {
      progress.fail(`${dependency} - error`);
      return outputError("pack failed", packErr);
    }

    const projectPath = process.cwd();
    const projectPklStash = path.join(projectPath, ".pkl");
    await mkdir(projectPklStash);

    const packStash = path.join(projectPklStash, packedFileName);
    await moveFile(path.join(depedencyPath, packedFileName), packStash);

    progress.text = `${dependency} - installing...`;
    const {
      isError: isInstallError,
      stderr: installErr,
    } = await installDependency(projectPath, packStash, { yarn: program.yarn });

    if (isInstallError) {
      progress.fail(`${dependency} - error`);
      return outputError("install failed", installErr);
    }

    progress.succeed(`${dependency} - installed`);
  }

  return outputSuccess(
    "installation complete",
    ...dependencies.map((dependency) => {
      const { name, version } = dependencyPackages[dependency];
      return ` - ${dependency} (${monorepo}) → ${name}@${version || "0.0.0"}`;
    })
  );
})();
