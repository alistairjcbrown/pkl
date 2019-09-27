jest.mock("child_process", () => ({ exec: jest.fn() }));
jest.mock("../get-lerna", () => () => "lerna");

const path = require("path");
const { exec } = require("child_process");
const getPackage = require("../get-package");
const {
  lernaListWithDependency,
  lernaListWithoutDependency
} = require("./test-data/command-output");

const lernaCommand = [
  "lerna ls --json",
  { cwd: "/my/monorepo/path/" },
  expect.any(Function)
];

describe("get-packaage", () => {
  let value;

  beforeEach(() => {
    jest.clearAllMocks();
    value = undefined;
  });

  describe("when lerna fails to get list", () => {
    beforeEach(async () => {
      exec.mockImplementation((command, options, callback) => {
        callback(null, {
          stdout: "",
          stderr:
            "lerna ERR! ENOLERNA `lerna.json` does not exist, have you run `lerna init`?"
        });
      });
      value = await getPackage("/my/monorepo/path/", "test-dependency", {});
    });

    it("should execute npm command searching for lerna", () => {
      expect(exec).toHaveBeenCalledTimes(1);
      expect(exec).toHaveBeenCalledWith(...lernaCommand);
    });

    it("should return object with error", () => {
      expect(value).toStrictEqual({
        err: "unable to list packages at /my/monorepo/path/"
      });
    });
  });

  describe("when dependency provided matches lerna entry", () => {
    beforeEach(async () => {
      exec.mockImplementation((command, options, callback) => {
        callback(null, {
          stdout: lernaListWithDependency,
          stderr: ""
        });
      });
      value = await getPackage("/my/monorepo/path/", "test-dependency", {});
    });

    it("should execute npm command searching for lerna", () => {
      expect(exec).toHaveBeenCalledTimes(1);
      expect(exec).toHaveBeenCalledWith(...lernaCommand);
    });

    it("should return object with package data", () => {
      expect(Object.keys(value)).toStrictEqual(["err", "path", "packageJson"]);
      expect(value.err).toBe(null);
      expect(value.path).toStrictEqual(
        expect.stringMatching(
          /tests\/test-data\/mock-monorepo\/packages\/test-dependency$/
        )
      );
      expect(value.packageJson).toStrictEqual({
        description: "",
        license: "MIT",
        main: "index.js",
        name: "mock-dependency",
        private: true,
        version: "1.0.0"
      });
    });
  });

  describe("when dependency provided matches directory name", () => {
    let mockMonorepoPath;

    beforeEach(async () => {
      exec.mockImplementation((command, options, callback) => {
        callback(null, {
          stdout: lernaListWithoutDependency,
          stderr: ""
        });
      });
      mockMonorepoPath = path.resolve(__dirname, "./test-data/mock-monorepo");
      value = await getPackage(mockMonorepoPath, "test-dependency", {});
    });

    it("should execute npm command searching for lerna", () => {
      expect(exec).toHaveBeenCalledTimes(1);
      expect(exec).toHaveBeenCalledWith(
        lernaCommand[0],
        { cwd: mockMonorepoPath },
        lernaCommand[2]
      );
    });

    it("should return object with package data", () => {
      expect(Object.keys(value)).toStrictEqual(["err", "path", "packageJson"]);
      expect(value.err).toBe(null);
      expect(value.path).toStrictEqual(
        expect.stringMatching(
          /tests\/test-data\/mock-monorepo\/packages\/test-dependency$/
        )
      );
      expect(value.packageJson).toStrictEqual({
        description: "",
        license: "MIT",
        main: "index.js",
        name: "mock-dependency",
        private: true,
        version: "1.0.0"
      });
    });
  });

  describe("when dependency provided does not match", () => {
    beforeEach(async () => {
      exec.mockImplementation((command, options, callback) => {
        callback(null, {
          stdout: lernaListWithoutDependency,
          stderr: ""
        });
      });
      value = await getPackage("/my/monorepo/path/", "test-dependency", {});
    });

    it("should execute npm command searching for lerna", () => {
      expect(exec).toHaveBeenCalledTimes(1);
      expect(exec).toHaveBeenCalledWith(...lernaCommand);
    });

    it("should return object with error", () => {
      expect(value).toStrictEqual({
        err: "unable to get package.json for test-dependency"
      });
    });
  });
});
