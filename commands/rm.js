#!/usr/bin/env node

const program = require("commander");
const {
  writeFile,
  getMappingPath,
  getMonorepoMapping,
  outputSuccess,
} = require("./lib/utils");

(async function rm() {
  program.name("pkl-rm").usage("<monorepo-name> [options]").description(
    `
Removes a monorepo by name, so it no longer shows in the monorepo list
(\`ls\`) and cannot be used when running \`install\`.
`.trim()
  );

  program.parse(process.argv);
  const [monorepo] = program.args;

  if (!monorepo) {
    return program.missingArgument("monorepo");
  }

  const monorepoMapping = getMonorepoMapping();

  const removedValue = monorepoMapping[monorepo];
  if (!removedValue) {
    return outputSuccess(`removed ${monorepo} (key not set)`);
  }

  delete monorepoMapping[monorepo];
  await writeFile(getMappingPath(), monorepoMapping);

  return outputSuccess(
    `removed ${monorepo}`,
    ` - Removed mapping to ${removedValue}`
  );
})();
