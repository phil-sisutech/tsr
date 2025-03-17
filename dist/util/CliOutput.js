import { relative } from "node:path";
import pc from "picocolors";
import { formatCount } from "./formatCount.js";
const getLinePosition = (content, position) => {
  const result = {
    line: 0,
    pos: 0
  };
  for (let i = 0; i < content.length; i++) {
    if (i === position) {
      return `${result.line}:${result.pos}`;
    }
    if (content[i] === "\n") {
      result.line++;
      result.pos = 0;
    } else {
      result.pos++;
    }
  }
  throw new Error("position is out of range");
};
class CliOutput {
  #removedExportCount = 0;
  #deletedFileCount = 0;
  #projectRoot;
  #logger;
  #mode;
  constructor({
    logger,
    projectRoot,
    mode
  }) {
    this.#logger = logger;
    this.#mode = mode;
    this.#projectRoot = projectRoot;
  }
  deleteFile(file) {
    this.#logger.write(`${pc.yellow("file")}   ${this.#relativePath(file)}
`);
    this.#deletedFileCount++;
  }
  removeExport({
    file,
    position,
    code,
    content
  }) {
    this.#logger.write(
      `${pc.yellow("export")} ${this.#relativePath(file)}:${pc.gray(
        getLinePosition(content, position).padEnd(7)
      )} ${pc.gray(`'${code}'`)}
`
    );
    this.#removedExportCount++;
  }
  done() {
    const result = [
      this.#deletedFileCount > 0 ? `${this.#mode === "check" ? "delete" : "deleted"} ${formatCount(this.#deletedFileCount, "file")}` : "",
      this.#removedExportCount > 0 ? `${this.#mode === "check" ? "remove" : "removed"} ${formatCount(this.#removedExportCount, "export")}` : ""
    ].filter((t) => !!t);
    if (this.#mode === "check" && result.length > 0) {
      this.#logger.write(pc.red(pc.bold(`\u2716 ${result.join(", ")}
`)));
      return {
        code: 1
      };
    }
    this.#logger.write(
      pc.green(
        pc.bold(`\u2714 ${result.length > 0 ? result.join(", ") : "all good!"}
`)
      )
    );
    return { code: 0 };
  }
  #relativePath(file) {
    return relative(this.#projectRoot, file).replaceAll("\\", "/");
  }
}
export {
  CliOutput
};
