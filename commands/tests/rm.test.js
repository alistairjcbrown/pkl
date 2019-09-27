jest.mock("../lib/utils");

const program = require("commander");
const {
  getMappingPath,
  getMonorepoMapping,
  outputSuccess,
  writeFile
} = require("../lib/utils");

describe("rm", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    getMappingPath.mockReturnValue("path/to/mapping.json");
  });

  describe("when monorepo name is not provided", () => {
    beforeEach(() => {
      process.argv = ["node", ".pkl/commands/rm.js"];

      program.missingArgument = jest.fn();
      getMonorepoMapping.mockReturnValue({});
      jest.isolateModules(() => require("../rm"));
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
      process.argv = ["node", ".pkl/commands/rm.js", "test-monorepo"];
    });

    describe("when monorepo mapping is empty", () => {
      beforeEach(() => {
        getMonorepoMapping.mockReturnValue({});
        jest.isolateModules(() => require("../rm"));
      });

      it("should not update mapping file", () => {
        expect(writeFile).not.toHaveBeenCalled();
      });

      it("should output success with no key set suffix", () => {
        expect(outputSuccess).toHaveBeenCalledTimes(1);
        expect(outputSuccess).toHaveBeenCalledWith(
          "removed test-monorepo (key not set)"
        );
      });
    });

    describe("when monorepo mapping does not contain corresponding mapping", () => {
      beforeEach(() => {
        getMonorepoMapping.mockReturnValue({
          foo: "/my/monorepo/path/",
          bar: "/my/other/monorepo/path/"
        });
        jest.isolateModules(() => require("../rm"));
      });

      it("should not update mapping file", () => {
        expect(writeFile).not.toHaveBeenCalled();
      });

      it("should output success with no key set suffix", () => {
        expect(outputSuccess).toHaveBeenCalledTimes(1);
        expect(outputSuccess).toHaveBeenCalledWith(
          "removed test-monorepo (key not set)"
        );
      });
    });

    describe("when monorepo mapping contains corresponding mapping", () => {
      beforeEach(() => {
        getMonorepoMapping.mockReturnValue({
          foo: "/my/monorepo/path/",
          "test-monorepo": "/my/other/monorepo/path/"
        });
        jest.isolateModules(() => require("../rm"));
      });

      it("should update mapping file", () => {
        expect(writeFile).toHaveBeenCalledTimes(1);
        expect(writeFile).toHaveBeenCalledWith("path/to/mapping.json", {
          foo: "/my/monorepo/path/"
        });
      });

      it("should output success with details of removed maapping", () => {
        expect(outputSuccess).toHaveBeenCalledTimes(1);
        expect(outputSuccess).toHaveBeenCalledWith(
          "removed test-monorepo",
          " - Removed mapping to /my/other/monorepo/path/"
        );
      });
    });
  });
});
