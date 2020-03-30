jest.mock("../lib/utils");

const program = require("commander");
const {
  getMappingPath,
  getCommandCache,
  getMonorepoMapping,
  outputSuccess,
  writeFile,
} = require("../lib/utils");

describe("add", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    process.cwd = jest.fn().mockReturnValue("/my/monorepo/path");
    getMappingPath.mockReturnValue("path/to/mapping.json");
    getCommandCache.mockReturnValue("path/to/");
  });

  describe("when monorepo name is not provided", () => {
    beforeEach(() => {
      process.argv = ["node", ".pkl/commands/add.js"];

      program.missingArgument = jest.fn();
      getMonorepoMapping.mockReturnValue({});
      jest.isolateModules(() => require("../add"));
    });

    it("should not update mapping file", () => {
      expect(writeFile).not.toHaveBeenCalled();
    });

    it("should output missing monorepo error", () => {
      expect(program.missingArgument).toHaveBeenCalledTimes(1);
      expect(program.missingArgument).toHaveBeenCalledWith("monorepo");
    });
  });

  describe("when monorepo name is provided", () => {
    beforeEach(() => {
      process.argv = ["node", ".pkl/commands/add.js", "test-monorepo"];
    });

    describe("when monorepo mapping is empty", () => {
      beforeEach(() => {
        getMonorepoMapping.mockReturnValue({});
        jest.isolateModules(() => require("../add"));
      });

      it("should update mapping file", () => {
        expect(writeFile).toHaveBeenCalledTimes(1);
        expect(writeFile).toHaveBeenCalledWith("path/to/mapping.json", {
          "test-monorepo": "/my/monorepo/path",
        });
      });

      it("should output success with details of added maapping", () => {
        expect(outputSuccess).toHaveBeenCalledTimes(1);
        expect(outputSuccess).toHaveBeenCalledWith(
          "added test-monorepo",
          " - Name mapped to /my/monorepo/path"
        );
      });
    });

    describe("when monorepo mapping is populated", () => {
      beforeEach(() => {
        getMonorepoMapping.mockReturnValue({
          foo: "/my/monorepo/path",
          bar: "/my/other/monorepo/path",
        });
        jest.isolateModules(() => require("../add"));
      });

      it("should update mapping file", () => {
        expect(writeFile).toHaveBeenCalledTimes(1);
        expect(writeFile).toHaveBeenCalledWith("path/to/mapping.json", {
          foo: "/my/monorepo/path",
          bar: "/my/other/monorepo/path",
          "test-monorepo": "/my/monorepo/path",
        });
      });

      it("should output success with details of added maapping", () => {
        expect(outputSuccess).toHaveBeenCalledTimes(1);
        expect(outputSuccess).toHaveBeenCalledWith(
          "added test-monorepo",
          " - Name mapped to /my/monorepo/path"
        );
      });
    });

    describe("when monorepo mapping is populated and already contains key", () => {
      beforeEach(() => {
        getMonorepoMapping.mockReturnValue({
          foo: "/my/monorepo/path",
          "test-monorepo": "/my/other/monorepo/path",
        });
        jest.isolateModules(() => require("../add"));
      });

      it("should update mapping file", () => {
        expect(writeFile).toHaveBeenCalledTimes(1);
        expect(writeFile).toHaveBeenCalledWith("path/to/mapping.json", {
          foo: "/my/monorepo/path",
          "test-monorepo": "/my/monorepo/path",
        });
      });

      it("should output success with details of added maapping", () => {
        expect(outputSuccess).toHaveBeenCalledTimes(1);
        expect(outputSuccess).toHaveBeenCalledWith(
          "added test-monorepo",
          " - Name mapped to /my/monorepo/path",
          " - Existing entry replaced /my/other/monorepo/path"
        );
      });
    });
  });

  describe("when monorepo path is provided", () => {
    beforeEach(() => {
      process.argv = [
        "node",
        ".pkl/commands/add.js",
        "test-monorepo",
        "./monorepo-directory",
      ];
      getMonorepoMapping.mockReturnValue({
        foo: "/my/monorepo/path",
      });
      jest.isolateModules(() => require("../add"));
    });

    it("should update mapping file", () => {
      expect(writeFile).toHaveBeenCalledTimes(1);
      expect(writeFile.mock.calls[0][0]).toBe("path/to/mapping.json");
      expect(Object.keys(writeFile.mock.calls[0][1])).toStrictEqual([
        "foo",
        "test-monorepo",
      ]);
      expect(writeFile.mock.calls[0][1].foo).toBe("/my/monorepo/path");
      expect(writeFile.mock.calls[0][1]["test-monorepo"]).toStrictEqual(
        expect.stringMatching(/.*\/monorepo-directory$/)
      );
    });

    it("should output success with details of added maapping", () => {
      expect(outputSuccess).toHaveBeenCalledTimes(1);
      expect(outputSuccess.mock.calls[0][0]).toBe("added test-monorepo");
      expect(outputSuccess.mock.calls[0][1]).toStrictEqual(
        expect.stringMatching(/ - Name mapped to .*\/monorepo-directory$/)
      );
    });
  });
});
