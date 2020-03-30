/* eslint-disable no-console */
jest.mock("fs");
jest.mock("os", () => ({ homedir: jest.fn() }));

const path = require("path");
const os = require("os");
const fs = require("fs");
const {
  mkdir,
  writeFile,
  moveFile,
  outputError,
  outputSuccess,
  getCommandCache,
  getMappingPath,
  getMonorepoMapping,
  splitOutput,
  getLastLine,
} = require("../utils");

describe("utils", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("mkdir", () => {
    it("should be a function", () => {
      expect(typeof mkdir).toBe("function");
    });

    it("should wrap fs module", () => {
      mkdir("./test-directory");
      expect(fs.mkdir).toHaveBeenCalledTimes(1);
      expect(fs.mkdir).toHaveBeenCalledWith(
        "./test-directory",
        expect.any(Function)
      );
    });

    describe("when directory already exists", () => {
      let thrownError;

      beforeEach(async () => {
        fs.mkdir.mockImplementation(() => {
          const existsError = new Error("Test error");
          existsError.code = "EEXIST";
          throw existsError;
        });

        thrownError = undefined;
        try {
          await mkdir("./test-directory");
        } catch (e) {
          thrownError = e;
        }
      });

      it("should not throw an error", () => {
        expect(thrownError).toBe(undefined);
        expect(fs.mkdir).toHaveBeenCalledTimes(1);
        expect(fs.mkdir).toHaveBeenCalledWith(
          "./test-directory",
          expect.any(Function)
        );
      });
    });

    describe("when an error is encountered", () => {
      let thrownError;

      beforeEach(async () => {
        fs.mkdir.mockImplementation(() => {
          const existsError = new Error("Test error");
          existsError.code = "TEST";
          throw existsError;
        });

        thrownError = undefined;
        try {
          await mkdir("./test-directory");
        } catch (e) {
          thrownError = e;
        }
      });

      it("should throw an error", () => {
        expect(thrownError.code).toBe("TEST");
        expect(fs.mkdir).toHaveBeenCalledTimes(1);
        expect(fs.mkdir).toHaveBeenCalledWith(
          "./test-directory",
          expect.any(Function)
        );
      });
    });
  });

  describe("writeFile", () => {
    it("should be a function", () => {
      expect(typeof writeFile).toBe("function");
    });

    it("should wrap fs module", () => {
      writeFile("./test-file", { hello: "world", test: true });
      expect(fs.writeFile).toHaveBeenCalledTimes(1);
      expect(fs.writeFile).toHaveBeenCalledWith(
        "./test-file",
        `{
  "hello": "world",
  "test": true
}`,
        expect.any(Function)
      );
    });
  });

  describe("moveFile", () => {
    it("should be a function", () => {
      expect(typeof moveFile).toBe("function");
    });

    it("should wrap fs module", () => {
      moveFile("./test-file-old", "./test-file-new");
      expect(fs.rename).toHaveBeenCalledTimes(1);
      expect(fs.rename).toHaveBeenCalledWith(
        "./test-file-old",
        "./test-file-new",
        expect.any(Function)
      );
    });
  });

  describe("outputError", () => {
    beforeEach(() => {
      console.error = jest.fn();
      process.exit = jest.fn();
    });

    it("should be a function", () => {
      expect(typeof outputError).toBe("function");
    });

    it("should error output to the console for single value", () => {
      outputError("test");
      expect(console.error).toHaveBeenCalledTimes(1);
      expect(console.error).toHaveBeenCalledWith("error: %s", "test");
    });

    it("should error output to the console multiple times for multiple values", () => {
      outputError("test", "foo bar", "hello world");
      expect(console.error).toHaveBeenCalledTimes(3);
      expect(console.error).toHaveBeenCalledWith("error: %s", "test");
      expect(console.error).toHaveBeenCalledWith("foo bar");
      expect(console.error).toHaveBeenCalledWith("hello world");
    });

    it("should exit the program with error", () => {
      outputError("test");
      expect(process.exit).toHaveBeenCalledTimes(1);
      expect(process.exit).toHaveBeenCalledWith(1);
    });
  });

  describe("outputSuccess", () => {
    beforeEach(() => {
      console.log = jest.fn();
      process.exit = jest.fn();
    });

    it("should be a function", () => {
      expect(typeof outputSuccess).toBe("function");
    });

    it("should log output to the console for single value", () => {
      outputSuccess("test");
      expect(console.log).toHaveBeenCalledTimes(1);
      expect(console.log).toHaveBeenCalledWith("success: %s", "test");
    });

    it("should log output to the console multiple times for multiple values", () => {
      outputSuccess("test", "foo bar", "hello world");
      expect(console.log).toHaveBeenCalledTimes(3);
      expect(console.log).toHaveBeenCalledWith("success: %s", "test");
      expect(console.log).toHaveBeenCalledWith("foo bar");
      expect(console.log).toHaveBeenCalledWith("hello world");
    });

    it("should exit the program with success", () => {
      outputSuccess("test");
      expect(process.exit).toHaveBeenCalledTimes(1);
      expect(process.exit).toHaveBeenCalledWith();
    });
  });

  describe("getCommandCache", () => {
    it("should be a function", () => {
      expect(typeof getCommandCache).toBe("function");
    });

    it("should return cache location", () => {
      os.homedir.mockReturnValue("/my/home/directory");
      expect(getCommandCache()).toBe("/my/home/directory/.pkl");
    });
  });

  describe("getMappingPath", () => {
    it("should be a function", () => {
      expect(typeof getMappingPath).toBe("function");
    });

    it("should return mapping location", () => {
      os.homedir.mockReturnValue("/my/home/directory");
      expect(getMappingPath()).toBe(
        "/my/home/directory/.pkl/monorepo-mapping.json"
      );
    });
  });

  describe("getMonorepoMapping", () => {
    it("should be a function", () => {
      expect(typeof getMonorepoMapping).toBe("function");
    });

    describe("when mapping exists", () => {
      beforeEach(() => {
        const mockHomeDirectory = path.resolve(
          __dirname,
          "./test-data/mock-home-directory"
        );
        os.homedir.mockReturnValue(mockHomeDirectory);
      });

      it("should return mapping object", () => {
        expect(getMonorepoMapping()).toStrictEqual({ testMapping: true });
      });
    });

    describe("when mapping does not exist", () => {
      beforeEach(() => {
        const mockHomeDirectory = path.resolve(
          __dirname,
          "./test-data/mock-home-directory-not-exist"
        );
        os.homedir.mockReturnValue(mockHomeDirectory);
      });

      it("should return mapping object", () => {
        expect(getMonorepoMapping()).toStrictEqual({});
      });
    });
  });

  describe("splitOutput", () => {
    it("should be a function", () => {
      expect(typeof splitOutput).toBe("function");
    });

    it("should return an array of strings", () => {
      expect(
        splitOutput(`
          Hello World
          Testing content
      `)
      ).toStrictEqual(["Hello World", "          Testing content"]);
    });

    it("should return an array with an empty string for empty input", () => {
      expect(splitOutput("")).toStrictEqual([""]);
    });
  });

  describe("getLastLine", () => {
    it("should be a function", () => {
      expect(typeof getLastLine).toBe("function");
    });

    it("should return last line of string", () => {
      expect(
        getLastLine(`
          Hello World
          Testing content
      `)
      ).toBe("          Testing content");
    });

    it("should return an empty string for empty input", () => {
      expect(getLastLine("")).toStrictEqual("");
    });
  });
});
