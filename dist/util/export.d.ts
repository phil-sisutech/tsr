import ts from 'typescript';
type ClassDeclaration = {
    kind: ts.SyntaxKind.ClassDeclaration;
    name: string;
    change: {
        code: string;
        isUnnamedDefaultExport?: boolean;
        span: {
            start: number;
            length: number;
        };
    };
    skip: boolean;
    start: number;
};
type EnumDeclaration = {
    kind: ts.SyntaxKind.EnumDeclaration;
    name: string;
    change: {
        code: string;
        span: {
            start: number;
            length: number;
        };
    };
    skip: boolean;
    start: number;
};
type ExportAssignment = {
    kind: ts.SyntaxKind.ExportAssignment;
    name: 'default';
    change: {
        code: string;
        span: {
            start: number;
            length: number;
        };
    };
    skip: boolean;
    start: number;
};
type FunctionDeclaration = {
    kind: ts.SyntaxKind.FunctionDeclaration;
    name: string;
    change: {
        code: string;
        isUnnamedDefaultExport?: boolean;
        span: {
            start: number;
            length: number;
        };
    };
    skip: boolean;
    start: number;
};
type InterfaceDeclaration = {
    kind: ts.SyntaxKind.InterfaceDeclaration;
    name: string;
    change: {
        code: string;
        span: {
            start: number;
            length: number;
        };
    };
    skip: boolean;
    start: number;
};
type NameExportDeclaration = {
    kind: ts.SyntaxKind.ExportDeclaration;
    type: 'named';
    name: string[];
    skip: boolean;
    change: {
        code: string;
        span: {
            start: number;
            length: number;
        };
    };
    start: number;
};
type NamespaceExportDeclaration = {
    kind: ts.SyntaxKind.ExportDeclaration;
    type: 'namespace';
    name: string;
    start: number;
    change: {
        code: string;
        span: {
            start: number;
            length: number;
        };
    };
};
type TypeAliasDeclaration = {
    kind: ts.SyntaxKind.TypeAliasDeclaration;
    name: string;
    change: {
        code: string;
        span: {
            start: number;
            length: number;
        };
    };
    skip: boolean;
    start: number;
};
type VariableStatement = {
    kind: ts.SyntaxKind.VariableStatement;
    name: string[];
    change: {
        code: string;
        span: {
            start: number;
            length: number;
        };
    };
    skip: boolean;
    start: number;
};
type NamedExport = ClassDeclaration | EnumDeclaration | ExportAssignment | FunctionDeclaration | InterfaceDeclaration | NameExportDeclaration | NamespaceExportDeclaration | TypeAliasDeclaration | VariableStatement;
type WholeExportDeclarationBase = {
    kind: ts.SyntaxKind.ExportDeclaration;
    type: 'whole';
    specifier: string;
    start: number;
    change: {
        code: string;
        span: {
            start: number;
            length: number;
        };
    };
};
/**
 * Whole export when the file is found within the destFiles
 */
export type WholeExportDeclarationWithFile = WholeExportDeclarationBase & {
    file: string;
};
/**
 * Whole export when the file is not found within the destFiles, i.e. the file is not part of the project
 */
type WholeExportDeclarationWithoutFile = WholeExportDeclarationBase & {
    file: null;
};
type WholeExportDeclaration = WholeExportDeclarationWithFile | WholeExportDeclarationWithoutFile;
export declare const isWholeExportDeclarationWithFile: (exportDeclaration: WholeExportDeclaration) => exportDeclaration is WholeExportDeclarationWithFile;
export type Export = NamedExport | WholeExportDeclaration;
export declare const isNamedExport: (v: Export) => v is NamedExport;
export declare const isWholeExportDeclaration: (v: Export) => v is WholeExportDeclaration;
export {};
