import ts from 'typescript';
import { Vertexes } from './DependencyGraph.js';
export declare const findFileUsage: ({ targetFile, options, vertexes, files, fileNames, }: {
    targetFile: string;
    vertexes: Vertexes;
    files: Map<string, string>;
    fileNames: Set<string>;
    options: ts.CompilerOptions;
}) => Set<string>;
