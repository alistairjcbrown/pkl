jest.mock("child_process", () => ({ exec: jest.fn() }));

const { exec } = require("child_process");
const install = require("../install");

const npmCommand = [
  "npm install .pkl/mock-dependency.tgz",
  { cwd: "/my/project/path/" },
  expect.any(Function),
];

const yarnCommand = [
  "yarn add file:.pkl/mock-dependency.tgz",
  { cwd: "/my/project/path/" },
  expect.any(Function),
];

describe("install", () => {
  let value;

  beforeEach(() => {
    jest.clearAllMocks();
    value = undefined;
  });

  describe("when using npm", () => {
    describe("when install is successful", () => {
      beforeEach(async () => {
        exec.mockImplementation((command, options, callback) => {
          callback(null, {
            stdout: `
              + mock-dependency@1.0.0
            `,
            stderr: `
              npm WARN deprecated left-pad@1.3.0: use String.prototype.padStart()
            `,
          });
        });
        value = await install(
          "/my/project/path/",
          "/my/project/path/.pkl/mock-dependency.tgz",
          {}
        );
      });

      it("should execute npm command to install dependency", () => {
        expect(exec).toHaveBeenCalledTimes(1);
        expect(exec).toHaveBeenCalledWith(...npmCommand);
      });

      it("should return object with install data", () => {
        expect(value).toStrictEqual({
          isError: false,
          stderr: `
              npm WARN deprecated left-pad@1.3.0: use String.prototype.padStart()
            `,
          stdout: `
              + mock-dependency@1.0.0
            `,
        });
      });
    });

    describe("when install is unsuccessful", () => {
      beforeEach(async () => {
        exec.mockImplementation((command, options, callback) => {
          callback(null, {
            stdout: "",
            stderr: `
              npm ERR! Could not install from ".pkl/mock-dependency.tgz" as it does not contain a package.json file.
            `,
          });
        });
        value = await install(
          "/my/project/path/",
          "/my/project/path/.pkl/mock-dependency.tgz",
          {}
        );
      });

      it("should execute npm command to install dependency", () => {
        expect(exec).toHaveBeenCalledTimes(1);
        expect(exec).toHaveBeenCalledWith(...npmCommand);
      });

      it("should return object with error", () => {
        expect(value).toStrictEqual({
          isError: true,
          stderr: `
              npm ERR! Could not install from ".pkl/mock-dependency.tgz" as it does not contain a package.json file.
            `,
          stdout: "",
        });
      });
    });
  });

  describe("when using yarn", () => {
    describe("when install is successful", () => {
      beforeEach(async () => {
        exec.mockImplementation((command, options, callback) => {
          callback(null, {
            stdout: `
              success Saved lockfile.
              success Saved 1 new dependency.
            `,
            stderr: `
              warning "foor > bar" has unmet peer dependency "baz"
            `,
          });
        });
        value = await install(
          "/my/project/path/",
          "/my/project/path/.pkl/mock-dependency.tgz",
          { yarn: true }
        );
      });

      it("should execute yarn command to install dependency", () => {
        expect(exec).toHaveBeenCalledTimes(1);
        expect(exec).toHaveBeenCalledWith(...yarnCommand);
      });

      it("should return object with install data", () => {
        expect(value).toStrictEqual({
          isError: false,
          stderr: `
              warning "foor > bar" has unmet peer dependency "baz"
            `,
          stdout: `
              success Saved lockfile.
              success Saved 1 new dependency.
            `,
        });
      });
    });

    describe("when install is unsuccessful", () => {
      beforeEach(async () => {
        exec.mockImplementation((command, options, callback) => {
          callback(null, {
            stdout: "",
            stderr: `
              error Package ".pkl/mock-dependency.tgz2" refers to a non-existing file"
            `,
          });
        });
        value = await install(
          "/my/project/path/",
          "/my/project/path/.pkl/mock-dependency.tgz",
          { yarn: true }
        );
      });

      it("should execute yarn command to install dependency", () => {
        expect(exec).toHaveBeenCalledTimes(1);
        expect(exec).toHaveBeenCalledWith(...yarnCommand);
      });

      it("should return object with error", () => {
        expect(value).toStrictEqual({
          isError: true,
          stderr: `
              error Package ".pkl/mock-dependency.tgz2" refers to a non-existing file"
            `,
          stdout: "",
        });
      });
    });
  });
});
