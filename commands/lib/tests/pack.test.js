jest.mock("child_process", () => ({ exec: jest.fn() }));
jest.mock("../get-lerna", () => () => "lerna");
jest.mock("../utils", () => {
  const { getLastLine } = jest.requireActual("../utils");
  return {
    getLastLine,
    writeFile: jest.fn(),
    moveFile: jest.fn()
  };
});

const path = require("path");
const { exec } = require("child_process");
const { moveFile, writeFile } = require("../utils");
const pack = require("../pack");

const npmCommand = [
  "lerna exec --scope mock-dependency -- npm pack",
  { cwd: "/my/monorepo/path/" },
  expect.any(Function)
];

const yarnCommand = [
  "lerna exec --scope mock-dependency -- yarn pack --json",
  { cwd: "/my/monorepo/path/" },
  expect.any(Function)
];

describe("pack", () => {
  let value;
  let mockDependencyPath;

  beforeEach(() => {
    jest.clearAllMocks();
    value = undefined;
    mockDependencyPath = path.resolve(
      __dirname,
      "./test-data/mock-monorepo/packages/test-dependency"
    );
  });

  describe("when using npm", () => {
    describe("when lerna executes successfully", () => {
      beforeEach(async () => {
        exec.mockImplementation((command, options, callback) => {
          callback(null, {
            stdout: `
              test-dependency.tgz
            `,
            stderr: `
              lerna info Executing command in 1 package: "npm pack"
              lerna success exec Executed command in 1 package: "npm pack"
            `
          });
        });
        value = await pack("/my/monorepo/path/", mockDependencyPath, {});
      });

      it("should execute npm command packing dependency", () => {
        expect(exec).toHaveBeenCalledTimes(1);
        expect(exec).toHaveBeenCalledWith(...npmCommand);
      });

      it("should return object with pack details", () => {
        expect(value).toStrictEqual({
          isError: false,
          file: "test-dependency.tgz",
          stderr: `
              lerna info Executing command in 1 package: "npm pack"
              lerna success exec Executed command in 1 package: "npm pack"
            `,
          stdout: `
              test-dependency.tgz
            `
        });
      });

      it("should leave the package file as is", () => {
        expect(moveFile).not.toHaveBeenCalled();
        expect(writeFile).not.toHaveBeenCalled();
      });
    });

    describe("when lerna executes unsuccessfully", () => {
      beforeEach(async () => {
        exec.mockImplementation((command, options, callback) => {
          callback(null, {
            stdout: "",
            stderr: `
              lerna info Executing command in 1 package: "npm pack"
              lerna ERR! npm pack exited 127 in 'test-dependency'
            `
          });
        });
        value = await pack("/my/monorepo/path/", mockDependencyPath, {});
      });

      it("should execute npm command packing dependency", () => {
        expect(exec).toHaveBeenCalledTimes(1);
        expect(exec).toHaveBeenCalledWith(...npmCommand);
      });

      it("should return object with pack details", () => {
        expect(value).toStrictEqual({
          isError: true,
          file: "",
          stderr: `
              lerna info Executing command in 1 package: "npm pack"
              lerna ERR! npm pack exited 127 in 'test-dependency'
            `,
          stdout: ""
        });
      });

      it("should leave the package file as is", () => {
        expect(moveFile).not.toHaveBeenCalled();
        expect(writeFile).not.toHaveBeenCalled();
      });
    });
  });

  describe("when using yarn", () => {
    describe("when lerna executes successfully", () => {
      beforeEach(async () => {
        exec.mockImplementation((command, options, callback) => {
          callback(null, {
            stdout: `
              {"type":"success","data":"Wrote tarball to \\"test-dependency.tgz\\"."}
            `,
            stderr: `
              lerna info Executing command in 1 package: "yarn pack --json"
              lerna success exec Executed command in 1 package: "yarn pack --json"
            `
          });
        });
        value = await pack("/my/monorepo/path/", mockDependencyPath, {
          yarn: true
        });
      });

      it("should execute yarn command packing dependency", () => {
        expect(exec).toHaveBeenCalledTimes(1);
        expect(exec).toHaveBeenCalledWith(...yarnCommand);
      });

      it("should return object with pack details", () => {
        expect(value).toStrictEqual({
          isError: false,
          file: "test-dependency.tgz",
          stderr: `
              lerna info Executing command in 1 package: "yarn pack --json"
              lerna success exec Executed command in 1 package: "yarn pack --json"
            `,
          stdout: `
              {"type":"success","data":"Wrote tarball to \\"test-dependency.tgz\\"."}
            `
        });
      });

      it("should leave the package file as is", () => {
        expect(moveFile).not.toHaveBeenCalled();
        expect(writeFile).not.toHaveBeenCalled();
      });
    });

    describe("when lerna executes unsuccessfully", () => {
      beforeEach(async () => {
        exec.mockImplementation((command, options, callback) => {
          callback(null, {
            stdout: "",
            stderr: `
              lerna info Executing command in 1 package: "yarn pack --json"
              lerna ERR! yarn pack --json exited 127 in 'test-dependency'
            `
          });
        });
        value = await pack("/my/monorepo/path/", mockDependencyPath, {
          yarn: true
        });
      });

      it("should execute yarn command packing dependency", () => {
        expect(exec).toHaveBeenCalledTimes(1);
        expect(exec).toHaveBeenCalledWith(...yarnCommand);
      });

      it("should return object with pack details", () => {
        expect(value).toStrictEqual({
          isError: true,
          file: "",
          stderr: `
              lerna info Executing command in 1 package: "yarn pack --json"
              lerna ERR! yarn pack --json exited 127 in 'test-dependency'
            `,
          stdout: ""
        });
      });

      it("should leave the package file as is", () => {
        expect(moveFile).not.toHaveBeenCalled();
        expect(writeFile).not.toHaveBeenCalled();
      });
    });
  });

  describe("when dependency is not versioned", () => {
    let mockUnversionedDependencyPath;

    beforeEach(() => {
      mockUnversionedDependencyPath = path.resolve(
        __dirname,
        "./test-data/mock-monorepo/packages/test-unversioned-dependency"
      );
    });

    describe("when lerna executes successfully", () => {
      beforeEach(async () => {
        exec.mockImplementation((command, options, callback) => {
          callback(null, {
            stdout: `
              test-dependency.tgz
            `,
            stderr: `
              lerna info Executing command in 1 package: "npm pack"
              lerna success exec Executed command in 1 package: "npm pack"
            `
          });
        });
        value = await pack(
          "/my/monorepo/path/",
          mockUnversionedDependencyPath,
          {}
        );
      });

      it("should execute npm command packing dependency", () => {
        expect(exec).toHaveBeenCalledTimes(1);
        expect(exec).toHaveBeenCalledWith(
          "lerna exec --scope mock-unversioned-dependency -- npm pack",
          npmCommand[1],
          npmCommand[2]
        );
      });

      it("should return object with pack details", () => {
        expect(value).toStrictEqual({
          isError: false,
          file: "test-dependency.tgz",
          stderr: `
              lerna info Executing command in 1 package: "npm pack"
              lerna success exec Executed command in 1 package: "npm pack"
            `,
          stdout: `
              test-dependency.tgz
            `
        });
      });

      it("should create modified package file with version", () => {
        const packagePathExpectation = expect.stringMatching(
          /test-data\/mock-monorepo\/packages\/test-unversioned-dependency\/package\.json$/
        );
        const packageBackupPathExpectation = expect.stringMatching(
          /test-data\/mock-monorepo\/packages\/test-unversioned-dependency\/package\.json\.pkl_backup$/
        );

        expect(moveFile).toHaveBeenCalledTimes(2);
        expect(moveFile.mock.calls[0][0]).toStrictEqual(packagePathExpectation);
        expect(moveFile.mock.calls[0][1]).toStrictEqual(
          packageBackupPathExpectation
        );
        expect(moveFile.mock.calls[1][0]).toStrictEqual(
          packageBackupPathExpectation
        );
        expect(moveFile.mock.calls[1][1]).toStrictEqual(packagePathExpectation);

        expect(writeFile).toHaveBeenCalledTimes(1);
        expect(writeFile.mock.calls[0][0]).toStrictEqual(
          packagePathExpectation
        );
        expect(writeFile.mock.calls[0][1]).toStrictEqual({
          description: "",
          license: "MIT",
          main: "index.js",
          name: "mock-unversioned-dependency",
          private: true,
          version: "0.0.0"
        });
      });
    });

    describe("when lerna executes unsuccessfully", () => {
      beforeEach(async () => {
        exec.mockImplementation((command, options, callback) => {
          callback(null, {
            stdout: "",
            stderr: `
              lerna info Executing command in 1 package: "npm pack"
              lerna ERR! npm pack exited 127 in 'test-dependency'
            `
          });
        });
        value = await pack(
          "/my/monorepo/path/",
          mockUnversionedDependencyPath,
          {}
        );
      });

      it("should execute npm command packing dependency", () => {
        expect(exec).toHaveBeenCalledTimes(1);
        expect(exec).toHaveBeenCalledWith(
          "lerna exec --scope mock-unversioned-dependency -- npm pack",
          npmCommand[1],
          npmCommand[2]
        );
      });

      it("should return object with pack details", () => {
        expect(value).toStrictEqual({
          isError: true,
          file: "",
          stderr: `
              lerna info Executing command in 1 package: "npm pack"
              lerna ERR! npm pack exited 127 in 'test-dependency'
            `,
          stdout: ""
        });
      });

      it("should create modified package file with version", () => {
        const packagePathExpectation = expect.stringMatching(
          /test-data\/mock-monorepo\/packages\/test-unversioned-dependency\/package\.json$/
        );
        const packageBackupPathExpectation = expect.stringMatching(
          /test-data\/mock-monorepo\/packages\/test-unversioned-dependency\/package\.json\.pkl_backup$/
        );

        expect(moveFile).toHaveBeenCalledTimes(2);
        expect(moveFile.mock.calls[0][0]).toStrictEqual(packagePathExpectation);
        expect(moveFile.mock.calls[0][1]).toStrictEqual(
          packageBackupPathExpectation
        );
        expect(moveFile.mock.calls[1][0]).toStrictEqual(
          packageBackupPathExpectation
        );
        expect(moveFile.mock.calls[1][1]).toStrictEqual(packagePathExpectation);

        expect(writeFile).toHaveBeenCalledTimes(1);
        expect(writeFile.mock.calls[0][0]).toStrictEqual(
          packagePathExpectation
        );
        expect(writeFile.mock.calls[0][1]).toStrictEqual({
          description: "",
          license: "MIT",
          main: "index.js",
          name: "mock-unversioned-dependency",
          private: true,
          version: "0.0.0"
        });
      });
    });
  });
});
