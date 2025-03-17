import ts from 'typescript';
import { FileService } from './FileService.js';
import { Output } from './Output.js';
export declare const edit: ({ entrypoints, fileService, deleteUnusedFile, enableCodeFix, output, options, projectRoot, recursive, }: {
    entrypoints: string[];
    fileService: FileService;
    enableCodeFix?: boolean;
    deleteUnusedFile?: boolean;
    output?: Output;
    options?: ts.CompilerOptions;
    projectRoot?: string;
    recursive: boolean;
}) => void;
