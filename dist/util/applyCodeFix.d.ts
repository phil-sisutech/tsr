import ts from 'typescript';
export declare const fixIdDelete = "unusedIdentifier_delete";
export declare const fixIdDeleteImports = "unusedIdentifier_deleteImports";
type FixId = typeof fixIdDelete | typeof fixIdDeleteImports;
export declare const applyCodeFix: ({ fixId, languageService, fileName, }: {
    fixId: FixId;
    fileName: string;
    languageService: ts.LanguageService;
}) => string;
export {};
