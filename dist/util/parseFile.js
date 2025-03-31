import ts from "typescript";
import { memoize } from "./memoize.js";
import { namespaceUsage } from "./namespaceUsage.js";
const getLeadingComment = (node) => {
  const fullText = node.getSourceFile().getFullText();
  const ranges = ts.getLeadingCommentRanges(fullText, node.getFullStart());
  if (!ranges) {
    return "";
  }
  return ranges.map((range) => fullText.slice(range.pos, range.end)).join("");
};
const SKIP_KEYWORD = ["tsr-skip", "ts-remove-unused-skip"];
const skip = (node) => {
  const comment = getLeadingComment(node);
  return SKIP_KEYWORD.some((keyword) => comment.includes(keyword));
};
const isGlobalScopeAugmentation = (module) => !!(module.flags & ts.NodeFlags.GlobalAugmentation);
const resolve = ({
  specifier,
  file,
  destFiles,
  options
}) => ts.resolveModuleName(specifier, file, options, {
  fileExists(f) {
    return destFiles.has(f);
  },
  readFile(f) {
    throw new Error(`Unexpected readFile call: ${f}`);
  }
}).resolvedModule?.resolvedFileName;
const getChange = (node) => {
  if (ts.isExportDeclaration(node) || ts.isExportAssignment(node)) {
    return {
      code: node.getFullText(),
      span: {
        start: node.getFullStart(),
        length: node.getFullWidth()
      }
    };
  }
  if ((ts.isFunctionDeclaration(node) || ts.isClassDeclaration(node)) && !node.name) {
    return {
      code: node.getFullText(),
      isUnnamedDefaultExport: true,
      span: {
        start: node.getFullStart(),
        length: node.getFullWidth()
      }
    };
  }
  const syntaxListIndex = node.getChildren().findIndex((n) => n.kind === ts.SyntaxKind.SyntaxList);
  const syntaxList = node.getChildren()[syntaxListIndex];
  if (!syntaxList) {
    throw new Error("syntaxList missing");
  }
  const firstKeywordToDeleteIndex = syntaxList.getChildren().findIndex((n) => n.kind !== ts.SyntaxKind.Decorator);
  const firstKeywordToDelete = syntaxList.getChildren()[firstKeywordToDeleteIndex];
  if (!firstKeywordToDelete) {
    throw new Error(
      "Unexpected syntax list when looking for keywords after decorators"
    );
  }
  const nextSibling = node.getChildren()[syntaxListIndex + 1];
  if (!nextSibling) {
    throw new Error("No sibling after syntax list");
  }
  return {
    code: node.getSourceFile().getFullText().slice(firstKeywordToDelete.getStart(), nextSibling.getStart()),
    span: {
      start: firstKeywordToDelete.getStart(),
      length: nextSibling.getStart() - firstKeywordToDelete.getStart()
    }
  };
};
const collectName = (node) => {
  if (ts.isIdentifier(node)) {
    return [node.getText()];
  }
  if (ts.isObjectBindingPattern(node)) {
    return node.elements.flatMap((element) => collectName(element.name));
  }
  if (ts.isArrayBindingPattern(node)) {
    return node.elements.flatMap(
      (element) => ts.isOmittedExpression(element) ? [] : collectName(element.name)
    );
  }
  return [];
};
const findDynamicImports = ({
  destFiles,
  sourceFile,
  file,
  options
}) => {
  const result = [];
  const visit = (node) => {
    if (ts.isCallExpression(node) && node.expression.kind === ts.SyntaxKind.ImportKeyword) {
      if (node.arguments[0] && ts.isStringLiteral(node.arguments[0])) {
        const resolved = resolve({
          specifier: node.arguments[0].text,
          destFiles,
          file,
          options
        });
        if (!resolved) {
          return;
        }
        result.push(resolved);
      }
      return;
    }
    node.forEachChild(visit);
  };
  sourceFile.forEachChild(visit);
  return result;
};
const fn = ({
  file,
  content,
  destFiles,
  options = {}
}) => {
  const imports = {};
  const exports = [];
  const ambientDeclarations = [];
  const sourceFile = ts.createSourceFile(
    file,
    content,
    ts.ScriptTarget.ESNext,
    true
  );
  const visit = (node) => {
    if (ts.isVariableStatement(node)) {
      const isExported = node.modifiers?.some(
        (m) => m.kind === ts.SyntaxKind.ExportKeyword
      );
      if (isExported) {
        const name = node.declarationList.declarations.flatMap(
          (d) => collectName(d.name)
        );
        exports.push({
          kind: ts.SyntaxKind.VariableStatement,
          name,
          change: getChange(node),
          skip: skip(node),
          start: node.getStart()
        });
      }
      return;
    }
    if (ts.isFunctionDeclaration(node) || ts.isInterfaceDeclaration(node) || ts.isClassDeclaration(node) || ts.isEnumDeclaration(node)) {
      const isExported = node.modifiers?.some(
        (m) => m.kind === ts.SyntaxKind.ExportKeyword
      );
      if (isExported) {
        if (node.modifiers?.some((m) => m.kind === ts.SyntaxKind.DefaultKeyword)) {
          exports.push({
            kind: node.kind,
            name: "default",
            change: getChange(node),
            skip: skip(node),
            start: node.getStart()
          });
        } else {
          exports.push({
            kind: node.kind,
            name: node.name?.getText() || "",
            change: getChange(node),
            skip: skip(node),
            start: node.getStart()
          });
        }
      }
      return;
    }
    if (ts.isTypeAliasDeclaration(node)) {
      const isExported = node.modifiers?.some(
        (m) => m.kind === ts.SyntaxKind.ExportKeyword
      );
      if (isExported) {
        exports.push({
          kind: node.kind,
          name: node.name.getText(),
          change: getChange(node),
          skip: skip(node),
          start: node.getStart()
        });
      }
      return;
    }
    if (ts.isExportAssignment(node) && !node.isExportEquals) {
      exports.push({
        kind: ts.SyntaxKind.ExportAssignment,
        name: "default",
        change: getChange(node),
        skip: skip(node),
        start: node.getStart()
      });
      return;
    }
    if (ts.isExportDeclaration(node) && node.exportClause?.kind === ts.SyntaxKind.NamedExports && !node.moduleSpecifier) {
      exports.push({
        kind: ts.SyntaxKind.ExportDeclaration,
        type: "named",
        // we always collect the name not the propertyName because its for exports
        name: node.exportClause.elements.map((element) => element.name.text),
        change: getChange(node),
        skip: skip(node),
        start: node.getStart()
      });
      return;
    }
    if (ts.isExportDeclaration(node) && node.exportClause?.kind === ts.SyntaxKind.NamedExports && node.moduleSpecifier && ts.isStringLiteral(node.moduleSpecifier)) {
      exports.push({
        kind: ts.SyntaxKind.ExportDeclaration,
        type: "named",
        // we always collect the name not the propertyName because its for exports
        name: node.exportClause.elements.map((element) => element.name.text),
        change: getChange(node),
        skip: false,
        start: node.getStart()
      });
      const resolved = resolve({
        specifier: node.moduleSpecifier.text,
        destFiles,
        file,
        options
      });
      if (resolved) {
        imports[resolved] ||= [];
        node.exportClause.elements.forEach((element) => {
          imports[resolved] ||= [];
          imports[resolved]?.push(
            element.propertyName?.text || element.name.text
          );
        });
      }
      return;
    }
    if (ts.isExportDeclaration(node) && node.exportClause?.kind === ts.SyntaxKind.NamespaceExport && node.moduleSpecifier && ts.isStringLiteral(node.moduleSpecifier)) {
      exports.push({
        kind: ts.SyntaxKind.ExportDeclaration,
        type: "namespace",
        name: node.exportClause.name.text,
        start: node.getStart(),
        change: getChange(node)
      });
      const resolved = resolve({
        specifier: node.moduleSpecifier.text,
        destFiles,
        file,
        options
      });
      if (resolved) {
        imports[resolved] ||= [];
        imports[resolved]?.push("*");
      }
      return;
    }
    if (ts.isExportDeclaration(node) && !node.exportClause && node.moduleSpecifier && ts.isStringLiteral(node.moduleSpecifier)) {
      const resolved = resolve({
        specifier: node.moduleSpecifier.text,
        destFiles,
        file,
        options
      });
      exports.push({
        kind: ts.SyntaxKind.ExportDeclaration,
        type: "whole",
        file: resolved || null,
        specifier: node.moduleSpecifier.text,
        start: node.getStart(),
        change: getChange(node)
      });
      if (resolved) {
        imports[resolved] ||= [];
        imports[resolved]?.push({ type: "wholeReexport", file });
      }
      return;
    }
    if (ts.isImportDeclaration(node) && ts.isStringLiteral(node.moduleSpecifier)) {
      const resolved = resolve({
        specifier: node.moduleSpecifier.text,
        destFiles,
        file,
        options
      });
      if (!resolved) {
        return;
      }
      if (node.importClause?.namedBindings?.kind === ts.SyntaxKind.NamespaceImport) {
        imports[resolved] ||= [];
        const usage = namespaceUsage({ sourceFile });
        imports[resolved]?.push(
          ...usage.get(node.importClause.namedBindings.name.text)
        );
        return;
      }
      if (node.importClause?.namedBindings?.kind === ts.SyntaxKind.NamedImports) {
        const namedImports = node.importClause?.namedBindings;
        namedImports.elements.forEach((element) => {
          imports[resolved] ||= [];
          imports[resolved]?.push(
            element.propertyName?.text || element.name.text
          );
        });
      }
      if (node.importClause?.name) {
        imports[resolved] ||= [];
        imports[resolved]?.push("default");
      }
      if (!node.importClause) {
        imports[resolved] ||= [];
        imports[resolved]?.push("#side-effect");
      }
      return;
    }
    if (ts.isModuleDeclaration(node)) {
      if (node.name.kind === ts.SyntaxKind.StringLiteral || isGlobalScopeAugmentation(node)) {
        ambientDeclarations.push({
          kind: ts.SyntaxKind.ModuleDeclaration
        });
        return;
      }
      return;
    }
    return;
  };
  sourceFile.forEachChild(visit);
  if (content.includes("import(")) {
    findDynamicImports({
      destFiles,
      file,
      sourceFile,
      options
    }).forEach((resolved) => {
      imports[resolved] ||= [];
      imports[resolved]?.push("*");
    });
  }
  return { imports, exports, ambientDeclarations };
};
const parseFile = memoize(fn, {
  key: (arg) => `${arg.file}::${arg.content}::${key(arg.destFiles)}::${arg.options ? key(arg.options) : ""}`
});
const weakMap = /* @__PURE__ */ new WeakMap();
let current = 0;
const key = (obj) => {
  if (weakMap.has(obj)) {
    return weakMap.get(obj);
  }
  current++;
  weakMap.set(obj, current);
  return current;
};
export {
  parseFile
};
