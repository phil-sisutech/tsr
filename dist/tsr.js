import ts from "typescript";
import { MemoryFileService } from "./util/MemoryFileService.js";
import { edit } from "./util/edit.js";
import pc from "picocolors";
import { cwd, stdout } from "node:process";
import { relative, resolve } from "node:path";
import { formatCount } from "./util/formatCount.js";
import { CliOutput } from "./util/CliOutput.js";
import { ArgError, CheckResultError } from "./util/error.js";
const createNodeJsLogger = () => "isTTY" in stdout && stdout.isTTY ? {
  write: stdout.write.bind(stdout),
  clearLine: stdout.clearLine.bind(stdout),
  cursorTo: stdout.cursorTo.bind(stdout),
  isTTY: true
} : {
  write: stdout.write.bind(stdout),
  isTTY: false
};
const relativeToCwd = (fileName) => relative(cwd(), fileName).replaceAll("\\", "/");
const tsr = async ({
  entrypoints,
  mode,
  configFile = "tsconfig.json",
  projectRoot = cwd(),
  recursive = false,
  system = ts.sys,
  logger = createNodeJsLogger(),
  includeDts = false
}) => {
  const configPath = resolve(projectRoot, configFile);
  const { config, error } = configPath ? ts.readConfigFile(configPath, system.readFile) : { config: {}, error: void 0 };
  const { options, fileNames } = ts.parseJsonConfigFileContent(
    config,
    system,
    projectRoot
  );
  const fileService = new MemoryFileService(
    fileNames.map((n) => [n, system.readFile(n) || ""])
  );
  const entrypointFiles = fileNames.filter(
    (fileName) => entrypoints.some((regex) => regex.test(fileName)) || // we want to include the .d.ts files as an entrypoint if includeDts is false
    !includeDts && /\.d\.ts$/.test(fileName)
  );
  if (entrypoints.length === 0) {
    logger.write(
      pc.red(
        pc.bold("At least one pattern must be specified for entrypoints\n")
      )
    );
    throw new ArgError();
  }
  if (entrypointFiles.length === 0) {
    logger.write(pc.red(pc.bold("No files matched the entrypoints pattern\n")));
    throw new ArgError();
  }
  logger.write(
    `${pc.blue("tsconfig")} ${error ? "using default options" : relativeToCwd(configPath)}
`
  );
  const output = new CliOutput({ logger, mode, projectRoot });
  logger.write(
    pc.gray(
      `Project has ${formatCount(fileNames.length, "file")}. Found ${formatCount(
        entrypointFiles.length,
        "entrypoint file"
      )}
`
    )
  );
  edit({
    fileService,
    entrypoints: entrypointFiles,
    deleteUnusedFile: true,
    enableCodeFix: mode === "write" || recursive,
    output,
    options,
    projectRoot,
    recursive
  });
  for (const target of fileNames) {
    if (!fileService.exists(target)) {
      if (mode == "write") {
        system.deleteFile?.(target);
      }
      continue;
    }
    if (parseInt(fileService.getVersion(target), 10) > 0 && mode === "write") {
      system.writeFile(target, fileService.get(target));
    }
  }
  const { code } = output.done();
  if (code !== 0) {
    throw new CheckResultError();
  }
};
export {
  tsr
};
