#!/usr/bin/env node

const program = require("commander");
const packageJson = require("./package.json");
const { outputError } = require("./commands/lib/utils");

program.version(packageJson.version);

program
  .command("add <monorepo-name>", "Add a named monorepo", {
    executableFile: "./commands/add.js",
  })
  .command("rm <monorepo-name>", "Remove a named monorepo", {
    executableFile: "./commands/rm.js",
  })
  .alias("remove")
  .command("ls", "List added monorepos and their locations", {
    executableFile: "./commands/ls.js",
  })
  .alias("list")
  .command(
    "install <monorepo-name> <package-name>",
    "Install the package from the named monorepo in the current project",
    { executableFile: "./commands/install.js" }
  );

program.on("command:*", (operands) => {
  outputError(
    `Invalid command "${operands.join(" ")}"`,
    "See --help for a list of available commands."
  );
});
program.parse(process.argv);
