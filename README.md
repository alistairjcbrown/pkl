# pkl

`pkl` (pronounced _pickle_) is a **p**ac**k**age **l**inker for
[lerna](https://lerna.js.org/) monorepos. Use it to install packages from your
monorepo into your application. This can be useful for trying a package which is
in development before you publish it.

## Installation

`pkl` can be installed from the npm registry and, as it works across projects,
should be installed globally.

### Using npm

```
npm install -g pkl
```

### Using yarn

```
yarn global add pkl
```

## Usage

There's a simple example below of adding a monorepo, listing all added
monorepos, using it to install a package from, and then removing the monorepo.

```
# Add a monorepo (so you can use it during install)
$ pkl add components ./path/to/my/component-library
success: added components
 - Name mapped to /Users/username/projects/path/to/my/component-library


# Show the monorepos you've added
$ pkl ls
success: showing 1 monorepo
 - components → /Users/username/projects/path/to/my/component-library


# Install package "button" into your project from the monorepo
cd ./my-project
$ pkl install components button
✔ button - installed
success: installation complete
 - button (components) → button@1.0.0


# Remove a monorepo (you don't be able to install from it any more)
$ pkl rm components
success: removed components
 - Removed mapping to /Users/username/projects/path/to/my/component-library
```

---

## Flags

To get help on the supported commands, use the `--help` flag (or run without any
flags or commands).

```
pkl --help
```

To see which version you have installed, use the `--version` flag.

```
pkl --version
```

Some command use `npm` as part of their implementation. To use `yarn` instead,
add the `--yarn` flag. This is only for supported commands; currently `install`.

```
pkl install components button --yarn
```

## Commands

`pkl` has four sub-commands; `add`, `rm`, `ls`, `install`

### `pkl-add` - add a named monorepo

#### Synopsis

```
pkl add <monorepo-name>
pkl add <monorepo-name> <folder-path>
```

#### Description

This command adds a monorepo name and location, so it shows in the monorepo list
(`ls`) and can be used when running `install`. If a path to the monorepo folder
is not provided, the current working directory (the one the command is run from)
will be used instead.

The monorepo name and location are added to the monorepo mapping JSON file,
which is stored at `~/.pkl/monorepo-mapping.json` and consists of each monorepo
name mapping to the corresponding absolute path.

### `pkl-rm` - remove a named monorepo

#### Synopsis

```
pkl rm <monorepo-name>
```

#### Description

This command removes a monorepo by name, so it no longer shows in the monorepo
list (`ls`) and cannot be used when running `install`.

The monorepo name entry is removed from the monorepo mapping JSON file, which is
stored at `~/.pkl/monorepo-mapping.json`.

### `pkl-ls` - list added monorepos and their locations

### Synopsis

```
pkl ls
```

#### Description

This command lists all the added monorepo names and locations, which can be used
when using the `install` command.

The monorepo mapping JSON file, stored at `~/.pkl/monorepo-mapping.json`, is
pretty printed to the console.

### `pkl-install` - install a package from a monorepo

#### Synopsis

```
pkl install <monorepo-name> <package-name>
pkl install <monorepo-name> <package-folder-name>
pkl install <monorepo-name> <package-folder-name> [...<package>]
```

#### Description

This command installs the named packages from the named monorepo, into the
project where the command is run. Packages can be referenced by their name (as
listed in the `name` field of their corresponding `package.json` file) or by
their folder name. Multiple packages can be listed to install more than one in a
single command.

**Note:** For packages without a version, these can only be referenced by their
folder name.

Packages to be installed are packed into tar files and moved into a `.pkl/`
folder within your project. These are then installed -- you may notice your
project `package.json` file referencing `file:.pkl/my-package.tgz` instead of a
version. To prevent committing these files, you should add the `.pkl/` directory
to your `.gitignore`.

By default, `install` will use `npm` to find `lerna`, pack packages and install
them. If you want to use `yarn` instead, add the `--yarn` flag to the end of
your command.

---

## Contributing

This cli tool is written using
[commander](https://www.npmjs.com/package/commander), with each command
implemented in its own file under the `./commands` folder.

Linting is enforced using [eslint](https://www.npmjs.com/package/eslint),
configured with
[airbnb-base](https://www.npmjs.com/package/eslint-config-airbnb-base) and
[prettier](https://www.npmjs.com/package/prettier).

```
npm run lint

# Run and apply automatic fixes for any issues
npm run lint -- --fix
```

Unit testing is written and run using
[jest](https://www.npmjs.com/package/jest), and relies heavily on mocking.

```
npm test

# Run specific test file
npm test -- ./path/to/file.test.js

# Run in watch mode
npm test -- --watch

# Generate coverage report
npm test -- --coverage
```
