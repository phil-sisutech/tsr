import ts from "typescript";
import { memoize } from "./memoize.js";
const fn = ({ sourceFile }) => {
  const program = createProgram({ sourceFile });
  const checker = program.getTypeChecker();
  const result = /* @__PURE__ */ new Map();
  const visit = (node) => {
    if (ts.isIdentifier(node)) {
      const symbol = checker.getSymbolAtLocation(node);
      let declaration = symbol?.declarations?.find((d) => d);
      while (declaration && ts.isShorthandPropertyAssignment(declaration)) {
        const s = checker.getShorthandAssignmentValueSymbol(declaration);
        declaration = s?.declarations?.find((d) => d);
      }
      if (declaration && ts.isNamespaceImport(declaration)) {
        switch (true) {
          case ts.isNamespaceImport(node.parent): {
            break;
          }
          case ts.isPropertyAccessExpression(node.parent): {
            const usage = node.parent.name.text;
            const importedNamespace = declaration.name.text;
            const prev = result.get(importedNamespace) || [];
            if (!prev.includes("*")) {
              result.set(importedNamespace, [...prev, usage]);
            }
            break;
          }
          default: {
            result.set(declaration.name.text, ["*"]);
            break;
          }
        }
      }
    }
    node.forEachChild(visit);
  };
  sourceFile.forEachChild(visit);
  return {
    get(name) {
      return result.get(name) || [];
    }
  };
};
const createProgram = ({ sourceFile }) => {
  const compilerHost = {
    getSourceFile: (fileName) => {
      if (fileName === sourceFile.fileName) {
        return sourceFile;
      }
      return void 0;
    },
    getDefaultLibFileName: (o) => ts.getDefaultLibFilePath(o),
    writeFile: () => {
      throw new Error("not implemented");
    },
    getCurrentDirectory: () => "/",
    fileExists: (fileName) => fileName === sourceFile.fileName,
    readFile: (fileName) => fileName === sourceFile.fileName ? sourceFile.text : void 0,
    getCanonicalFileName: (fileName) => ts.sys.useCaseSensitiveFileNames ? fileName : fileName.toLowerCase(),
    useCaseSensitiveFileNames: () => true,
    getNewLine: () => "\n"
  };
  const program = ts.createProgram([sourceFile.fileName], {}, compilerHost);
  return program;
};
const namespaceUsage = memoize(fn, {
  key: ({ sourceFile }) => `${sourceFile.fileName}::${sourceFile.text}`
});
export {
  namespaceUsage
};
