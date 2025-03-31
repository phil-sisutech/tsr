import ts from 'typescript';
import { FileService } from './FileService.js';
import { DependencyGraph } from './DependencyGraph.js';
export declare const createDependencyGraph: ({ fileService, entrypoints, options, }: {
    fileService: FileService;
    entrypoints: string[];
    options: ts.CompilerOptions;
}) => DependencyGraph;
