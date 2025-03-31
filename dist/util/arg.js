import mri from "mri";
const arg = (options) => {
  const config = options.reduce(
    (acc, cur) => {
      switch (cur.type) {
        case "boolean": {
          acc.boolean.push(cur.name);
          break;
        }
        case "string": {
          acc.string.push(cur.name);
          break;
        }
        default: {
          throw new Error(`Unknown type: ${cur}`);
        }
      }
      acc.default[cur.name] = cur.default;
      if ("alias" in cur && cur.alias) {
        acc.alias[cur.name] = cur.alias;
      }
      return acc;
    },
    {
      boolean: [],
      string: [],
      default: {},
      alias: {},
      unknown
    }
  );
  return {
    parse: (args) => mri(args, config)
  };
};
const unknown = (option) => {
  throw new Error(`Unknown option: ${option}`);
};
export {
  arg
};
