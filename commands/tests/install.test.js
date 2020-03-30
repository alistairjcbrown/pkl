jest.mock("../lib/get-package");
jest.mock("../lib/pack");
jest.mock("../lib/install");
jest.mock("../lib/utils");
jest.mock("ora", () => {
  const progress = {
    start: () => progress,
    fail: () => progress,
    succeed: () => progress,
  };
  return () => progress;
});

const program = require("commander");
const getPackage = require("../lib/get-package");
const packDependency = require("../lib/pack");
const installDependency = require("../lib/install");

const {
  getMonorepoMapping,
  outputError,
  outputSuccess,
  mkdir,
  moveFile,
} = require("../lib/utils");

const defer = (callback) => (done) =>
  setTimeout(() => {
    callback();
    done();
  }, 1);

const mockDependencyPackage = (options = { unversioned: false }) => ({
  err: null,
  path: `/my/monorepo/path/packages/test-${
    options.unversioned ? "unversioned-" : ""
  }dependency`,
  packageJson: {
    name: `mock-${options.unversioned ? "unversioned-" : ""}dependency`,
    version: options.unversioned ? undefined : "1.0.0",
  },
});

describe("install", () => {
  beforeEach(() => {
    jest.resetAllMocks();
    process.cwd = jest.fn().mockReturnValue("/my/project/path");
    process.argv = [
      "node",
      ".pkl/commands/install.js",
      "test-monorepo",
      "test-dependency",
    ];

    getMonorepoMapping.mockReturnValue({
      "test-monorepo": "/my/monorepo/path/",
    });

    getPackage.mockReturnValue(mockDependencyPackage());

    packDependency.mockReturnValue({
      isError: false,
      file: "test-dependency.tgz",
      stderr: 'lerna success exec Executed command in 1 package: "npm pack"',
      stdout: "test-dependency.tgz",
    });
  });

  describe("when monorepo name is not provided", () => {
    beforeEach(() => {
      process.argv = ["node", ".pkl/commands/install.js"];
      program.missingArgument = jest.fn();
      jest.isolateModules(() => require("../install"));
    });

    it("should not install", () => {
      expect(installDependency).not.toHaveBeenCalled();
    });

    it("should output missing monorepo error", () => {
      expect(program.missingArgument).toHaveBeenCalledTimes(1);
      expect(program.missingArgument).toHaveBeenCalledWith("monorepo");
    });
  });

  describe("when dependency name is not provided", () => {
    beforeEach(() => {
      process.argv = ["node", ".pkl/commands/install.js", "test-monorepo"];
      program.missingArgument = jest.fn();
      jest.isolateModules(() => require("../install"));
    });

    it("should not install", () => {
      expect(installDependency).not.toHaveBeenCalled();
    });

    it("should output missing dependency error", () => {
      expect(program.missingArgument).toHaveBeenCalledTimes(1);
      expect(program.missingArgument).toHaveBeenCalledWith("dependency");
    });
  });

  describe("when unknown monorepo name", () => {
    beforeEach(() => {
      getMonorepoMapping.mockReturnValue({});
      jest.isolateModules(() => require("../install"));
    });

    it("should not install", () => {
      expect(installDependency).not.toHaveBeenCalled();
    });

    it("should output unknown monorepo error", () => {
      expect(outputError).toHaveBeenCalledTimes(1);
      expect(outputError).toHaveBeenCalledWith("unknown monorepo name");
    });
  });

  describe("when dependency package.json cannot be found", () => {
    beforeEach(() => {
      getPackage.mockReturnValue({
        err: "unable to get package.json for test-dependency",
      });

      jest.isolateModules(() => require("../install"));
    });

    it("should not install", () => {
      expect(installDependency).not.toHaveBeenCalled();
    });

    it("should output error getting package.json", () => {
      expect(outputError).toHaveBeenCalledTimes(1);
      expect(outputError).toHaveBeenCalledWith(
        "unable to get package.json for test-dependency"
      );
    });
  });

  describe("when dependency pack fails", () => {
    beforeEach(() => {
      packDependency.mockReturnValue({
        isError: true,
        file: "",
        stderr: "lerna ERR! npm pack exited 127 in 'test-dependency'",
        stdout: "",
      });

      jest.isolateModules(() => require("../install"));
    });

    it("should not install", () => {
      expect(installDependency).not.toHaveBeenCalled();
    });

    it("should output error running pack", () => {
      expect(outputError).toHaveBeenCalledTimes(1);
      expect(outputError).toHaveBeenCalledWith(
        "pack failed",
        "lerna ERR! npm pack exited 127 in 'test-dependency'"
      );
    });
  });

  describe("when dependency install fails", () => {
    beforeEach(() => {
      installDependency.mockReturnValue({
        isError: true,
        stderr:
          'npm ERR! Could not install from ".pkl/mock-dependency.tgz" as it does not contain a package.json file.',
        stdout: "",
      });

      jest.isolateModules(() => require("../install"));
    });

    it("should call install", () => {
      expect(installDependency).toHaveBeenCalledTimes(1);
      expect(installDependency).toHaveBeenCalledWith(
        "/my/project/path",
        "/my/project/path/.pkl/test-dependency.tgz",
        { yarn: undefined }
      );
    });

    it(
      "should output error running install",
      defer(() => {
        expect(outputError).toHaveBeenCalledTimes(1);
        expect(outputError).toHaveBeenCalledWith(
          "install failed",
          'npm ERR! Could not install from ".pkl/mock-dependency.tgz" as it does not contain a package.json file.'
        );
      })
    );
  });

  describe("when dependency install is successful", () => {
    beforeEach(() => {
      installDependency.mockReturnValue({
        isError: false,
        stderr:
          "npm WARN deprecated left-pad@1.3.0: use String.prototype.padStart()",
        stdout: " + mock-dependency@1.0.0",
      });

      jest.isolateModules(() => require("../install"));
    });

    it("should call install", () => {
      expect(installDependency).toHaveBeenCalledTimes(1);
      expect(installDependency).toHaveBeenCalledWith(
        "/my/project/path",
        "/my/project/path/.pkl/test-dependency.tgz",
        { yarn: undefined }
      );
    });

    it("should create local .pkl directory", () => {
      expect(mkdir).toHaveBeenCalledTimes(1);
      expect(mkdir).toHaveBeenCalledWith("/my/project/path/.pkl");
    });

    it("should move pack file into place", () => {
      expect(moveFile).toHaveBeenCalledTimes(1);
      expect(moveFile).toHaveBeenCalledWith(
        "/my/monorepo/path/packages/test-dependency/test-dependency.tgz",
        "/my/project/path/.pkl/test-dependency.tgz"
      );
    });

    it(
      "should not output error",
      defer(() => {
        expect(outputError).not.toHaveBeenCalled();
      })
    );

    it(
      "should output success",
      defer(() => {
        expect(outputSuccess).toHaveBeenCalledTimes(1);
        expect(outputSuccess).toHaveBeenCalledWith(
          "installation complete",
          " - test-dependency (test-monorepo) → mock-dependency@1.0.0"
        );
      })
    );
  });

  describe("when multiple dependencies", () => {
    beforeEach(() => {
      process.argv = [...process.argv, "test-unversioned-dependency"];

      getPackage.mockReset();
      getPackage.mockReturnValueOnce(mockDependencyPackage());
      getPackage.mockReturnValueOnce(
        mockDependencyPackage({ unversioned: true })
      );

      packDependency.mockReset();
      packDependency.mockReturnValueOnce({
        isError: false,
        file: "test-dependency.tgz",
        stderr: 'lerna success exec Executed command in 1 package: "npm pack"',
        stdout: "test-dependency.tgz",
      });
      packDependency.mockReturnValueOnce({
        isError: false,
        file: "test-unversioned-dependency.tgz",
        stderr: 'lerna success exec Executed command in 1 package: "npm pack"',
        stdout: "test-unversioned-dependency.tgz",
      });

      installDependency.mockReturnValue({
        isError: false,
        stderr: "",
        stdout:
          " + mock-dependency@1.0.0\n + mock-unversioned-dependency@0.0.0",
      });

      jest.isolateModules(() => require("../install"));
    });

    it(
      "should call install",
      defer(() => {
        expect(installDependency).toHaveBeenCalledTimes(2);
        expect(installDependency).toHaveBeenCalledWith(
          "/my/project/path",
          "/my/project/path/.pkl/test-dependency.tgz",
          { yarn: undefined }
        );
        expect(installDependency).toHaveBeenCalledWith(
          "/my/project/path",
          "/my/project/path/.pkl/test-unversioned-dependency.tgz",
          { yarn: undefined }
        );
      })
    );

    it(
      "should create local .pkl directory",
      defer(() => {
        expect(mkdir).toHaveBeenCalledTimes(2);
        expect(mkdir).toHaveBeenCalledWith("/my/project/path/.pkl");
      })
    );

    it(
      "should move pack files into place",
      defer(() => {
        expect(moveFile).toHaveBeenCalledTimes(2);
        expect(moveFile).toHaveBeenCalledWith(
          "/my/monorepo/path/packages/test-dependency/test-dependency.tgz",
          "/my/project/path/.pkl/test-dependency.tgz"
        );
        expect(moveFile).toHaveBeenCalledWith(
          "/my/monorepo/path/packages/test-unversioned-dependency/test-unversioned-dependency.tgz",
          "/my/project/path/.pkl/test-unversioned-dependency.tgz"
        );
      })
    );

    it(
      "should not output error",
      defer(() => {
        expect(outputError).not.toHaveBeenCalled();
      })
    );

    it(
      "should output success",
      defer(() => {
        expect(outputSuccess).toHaveBeenCalledTimes(1);
        expect(outputSuccess).toHaveBeenCalledWith(
          "installation complete",
          " - test-dependency (test-monorepo) → mock-dependency@1.0.0",
          " - test-unversioned-dependency (test-monorepo) → mock-unversioned-dependency@0.0.0"
        );
      })
    );
  });

  describe("when using yarn", () => {
    beforeEach(() => {
      process.argv = [...process.argv, "--yarn"];

      installDependency.mockReturnValue({
        isError: false,
        stderr:
          "npm WARN deprecated left-pad@1.3.0: use String.prototype.padStart()",
        stdout: " + mock-dependency@1.0.0",
      });

      jest.isolateModules(() => require("../install"));
    });

    it("should call install", () => {
      expect(installDependency).toHaveBeenCalledTimes(1);
      expect(installDependency).toHaveBeenCalledWith(
        "/my/project/path",
        "/my/project/path/.pkl/test-dependency.tgz",
        { yarn: true }
      );
    });
  });
});
