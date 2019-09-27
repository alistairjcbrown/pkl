jest.mock("../lib/utils");

const { getMonorepoMapping, outputSuccess } = require("../lib/utils");

describe("ls", () => {
  beforeEach(() => {
    process.argv = ["node", ".pkl/commands/ls.js"];
    jest.clearAllMocks();
  });

  describe("when monorepo mapping is empty", () => {
    beforeEach(() => {
      getMonorepoMapping.mockReturnValue({});
      jest.isolateModules(() => require("../ls"));
    });

    it("should output no monorepos message", () => {
      expect(outputSuccess).toHaveBeenCalledTimes(1);
      expect(outputSuccess).toHaveBeenCalledWith("no monorepos");
    });
  });

  describe("when monorepo mapping has a single monorepo", () => {
    beforeEach(() => {
      getMonorepoMapping.mockReturnValue({
        foo: "/my/monorepo/path"
      });
      jest.isolateModules(() => require("../ls"));
    });

    it("should output no monorepos message", () => {
      expect(outputSuccess).toHaveBeenCalledTimes(1);
      expect(outputSuccess).toHaveBeenCalledWith(
        "showing 1 monorepo",
        " - foo → /my/monorepo/path"
      );
    });
  });

  describe("when monorepo mapping has multiple monorepos", () => {
    beforeEach(() => {
      getMonorepoMapping.mockReturnValue({
        foo: "/my/monorepo/path",
        bar: "/my/other/monorepo/path"
      });
      jest.isolateModules(() => require("../ls"));
    });

    it("should output no monorepos message", () => {
      expect(outputSuccess).toHaveBeenCalledTimes(1);
      expect(outputSuccess).toHaveBeenCalledWith(
        "showing 2 monorepos",
        " - foo → /my/monorepo/path\n - bar → /my/other/monorepo/path"
      );
    });
  });
});
