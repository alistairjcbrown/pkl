const path = require("path");

const stringify = value => JSON.stringify(value, null, 2);

const npmListWithLerna = stringify({
  name: "my-monorepo",
  dependencies: {
    lerna: {
      version: "3.16.0"
    }
  }
});

const npmListWithoutLerna = stringify({
  name: "my-monorepo"
});

const yarnListWithLerna = JSON.stringify({
  type: "tree",
  data: {
    type: "list",
    trees: [
      {
        name: "lerna@3.16.0",
        children: [],
        hint: null,
        color: null,
        depth: 0
      }
    ]
  }
});

const yarnListWithoutLerna = JSON.stringify({
  type: "tree",
  data: {
    type: "list",
    trees: []
  }
});

const lernaListWithDependency = JSON.stringify([
  {
    name: "test-dependency",
    version: "1.0.0",
    private: false,
    location: path.resolve(
      __dirname,
      "./mock-monorepo/packages/test-dependency"
    )
  }
]);

const lernaListWithoutDependency = JSON.stringify([
  {
    name: "other-test-dependency",
    version: "1.0.0",
    private: false,
    location: path.resolve(
      __dirname,
      "./mock-monorepo/packages/other-test-dependency"
    )
  }
]);

module.exports = {
  npmListWithLerna,
  npmListWithoutLerna,
  yarnListWithLerna,
  yarnListWithoutLerna,
  lernaListWithDependency,
  lernaListWithoutDependency
};
