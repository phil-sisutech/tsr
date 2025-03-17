import ts from 'typescript';
import { Export } from './export.js';
type AmbientDeclaration = {
    kind: ts.SyntaxKind.ModuleDeclaration;
};
export declare const parseFile: (args_0: {
    file: string;
    content: string;
    destFiles: Set<string>;
    options?: ts.CompilerOptions;
}) => {
    imports: {
        [file: string]: (string | {
            type: "wholeReexport";
            file: string;
        })[];
    };
    exports: Export[];
    ambientDeclarations: AmbientDeclaration[];
};
export {};
