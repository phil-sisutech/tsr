import ts from "typescript";
import { applyTextChanges } from "./applyTextChanges.js";
const fixIdDelete = "unusedIdentifier_delete";
const fixIdDeleteImports = "unusedIdentifier_deleteImports";
const filterChanges = ({
  sourceFile,
  textChanges
}) => {
  const result = [];
  const visit = (node) => {
    if ((ts.isArrowFunction(node) || ts.isMethodDeclaration(node) || ts.isFunctionDeclaration(node)) && node.parameters.length > 0) {
      const start = node.parameters[0]?.getStart();
      const end = node.parameters[node.parameters.length - 1]?.getEnd();
      if (typeof start === "number" && typeof end === "number") {
        result.push({ start, end });
      }
    }
    node.forEachChild(visit);
  };
  sourceFile.forEachChild(visit);
  return textChanges.filter((change) => {
    const start = change.span.start;
    const end = change.span.start + change.span.length;
    return !result.some((r) => r.start <= start && end <= r.end);
  });
};
const applyCodeFix = ({
  fixId,
  languageService,
  fileName
}) => {
  const program = languageService.getProgram();
  if (!program) {
    throw new Error("program not found");
  }
  const sourceFile = program.getSourceFile(fileName);
  if (!sourceFile) {
    throw new Error(`source file not found: ${fileName}`);
  }
  let content = sourceFile.getFullText();
  const actions = languageService.getCombinedCodeFix(
    {
      type: "file",
      fileName
    },
    fixId,
    {},
    {}
  );
  for (const change of actions.changes) {
    const textChanges = fixId === fixIdDelete ? filterChanges({ sourceFile, textChanges: change.textChanges }) : change.textChanges;
    content = applyTextChanges(content, textChanges);
  }
  return content;
};
export {
  applyCodeFix,
  fixIdDelete,
  fixIdDeleteImports
};
