#!/usr/bin/env node

const path = require("path");
const program = require("commander");
const {
  mkdir,
  writeFile,
  getCommandCache,
  getMappingPath,
  getMonorepoMapping,
  outputSuccess,
} = require("./lib/utils");

(async function add() {
  program.name("pkl-add").usage("<monorepo-name> [options]").description(
    `
Adds a monorepo name and location, so it shows in the monorepo list (\`ls\`) and
can be used when running \`install\`. If a path to the monorepo folder is not
provided, the current working directory (the one the command is run from) will
be used instead.
`.trim()
  );

  program.parse(process.argv);
  const [monorepo, monorepoPath] = program.args;

  if (!monorepo) {
    return program.missingArgument("monorepo");
  }

  await mkdir(getCommandCache());

  const originalMapping = getMonorepoMapping();
  const monorepoMapping = {
    ...originalMapping,
    [monorepo]: monorepoPath ? path.resolve(monorepoPath) : process.cwd(),
  };

  const addedValue = monorepoMapping[monorepo];
  await writeFile(getMappingPath(), monorepoMapping);

  const successOutput = [
    `added ${monorepo}`,
    ` - Name mapped to ${addedValue}`,
  ];
  if (originalMapping[monorepo]) {
    return outputSuccess(
      ...successOutput,
      ` - Existing entry replaced ${originalMapping[monorepo]}`
    );
  }
  return outputSuccess(...successOutput);
})();
