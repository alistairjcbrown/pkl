jest.mock("child_process", () => ({ exec: jest.fn() }));

const { exec } = require("child_process");
const getLerna = require("../get-lerna");
const {
  npmListWithLerna,
  npmListWithoutLerna,
  yarnListWithLerna,
  yarnListWithoutLerna
} = require("./test-data/command-output");

const npmCommand = [
  "npm ls lerna --json",
  { cwd: "/my/monorepo/path/" },
  expect.any(Function)
];

const yarnCommand = [
  "yarn list --depth=0 --pattern=lerna --json",
  { cwd: "/my/monorepo/path/" },
  expect.any(Function)
];

describe("get-lerna", () => {
  let value;

  beforeEach(() => {
    jest.clearAllMocks();
    value = undefined;
  });

  describe("when using npm", () => {
    describe("when lerna is installed locally", () => {
      beforeEach(async () => {
        exec.mockImplementation((command, options, callback) => {
          callback(null, {
            stdout: npmListWithLerna,
            stderr: ""
          });
        });
        value = await getLerna("/my/monorepo/path/", {});
      });

      it("should execute npm command searching for lerna", () => {
        expect(exec).toHaveBeenCalledTimes(1);
        expect(exec).toHaveBeenCalledWith(...npmCommand);
      });

      it("should return local path", () => {
        expect(value).toBe("node_modules/.bin/lerna");
      });
    });

    describe("when lerna is not installed locally", () => {
      beforeEach(async () => {
        exec.mockImplementation((command, options, callback) => {
          callback(null, {
            stdout: npmListWithoutLerna,
            stderr: ""
          });
        });
        value = await getLerna("/my/monorepo/path/", {});
      });

      it("should execute npm command searching for lerna", () => {
        expect(exec).toHaveBeenCalledTimes(1);
        expect(exec).toHaveBeenCalledWith(...npmCommand);
      });

      it("should return global", () => {
        expect(value).toBe("lerna");
      });
    });
  });

  describe("when using yarn", () => {
    describe("when lerna is installed locally", () => {
      beforeEach(async () => {
        exec.mockImplementation((command, options, callback) => {
          callback(null, {
            stdout: yarnListWithLerna,
            stderr: ""
          });
        });
        value = await getLerna("/my/monorepo/path/", { yarn: true });
      });

      it("should execute npm command searching for lerna", () => {
        expect(exec).toHaveBeenCalledTimes(1);
        expect(exec).toHaveBeenCalledWith(...yarnCommand);
      });

      it("should return local path", () => {
        expect(value).toBe("node_modules/.bin/lerna");
      });
    });

    describe("when lerna is not installed locally", () => {
      beforeEach(async () => {
        exec.mockImplementation((command, options, callback) => {
          callback(null, {
            stdout: yarnListWithoutLerna,
            stderr: ""
          });
        });
        value = await getLerna("/my/monorepo/path/", { yarn: true });
      });

      it("should execute npm command searching for lerna", () => {
        expect(exec).toHaveBeenCalledTimes(1);
        expect(exec).toHaveBeenCalledWith(...yarnCommand);
      });

      it("should return global", () => {
        expect(value).toBe("lerna");
      });
    });
  });
});
