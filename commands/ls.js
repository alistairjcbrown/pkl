#!/usr/bin/env node

const program = require("commander");
const { getMonorepoMapping, outputSuccess } = require("./lib/utils");

(async function ls() {
  program
    .name("pkl-ls")
    .usage("[options]")
    .description(
      `
Lists all the added monorepo names and locations, which can be used when using
the \`install\` command.
`.trim()
    );

  program.parse(process.argv);
  const monorepoMapping = getMonorepoMapping();

  if (Object.keys(monorepoMapping).length === 0) {
    return outputSuccess("no monorepos");
  }

  const monorepoList = Object.keys(monorepoMapping).map(
    monorepo => ` - ${monorepo} → ${monorepoMapping[monorepo]}`
  );

  const count = monorepoList.length;
  return outputSuccess(
    `showing ${count} monorepo${count === 1 ? "" : "s"}`,
    monorepoList.join("\n")
  );
})();
