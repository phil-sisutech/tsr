import ts from "typescript";
const isWholeExportDeclarationWithFile = (exportDeclaration) => exportDeclaration.file !== null;
const isNamedExport = (v) => "name" in v;
const isWholeExportDeclaration = (v) => v.kind === ts.SyntaxKind.ExportDeclaration && v.type === "whole";
export {
  isNamedExport,
  isWholeExportDeclaration,
  isWholeExportDeclarationWithFile
};
