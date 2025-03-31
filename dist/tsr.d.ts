import ts from 'typescript';
import { Logger } from './util/Logger.js';
export type Config = {
    entrypoints: RegExp[];
    mode: 'check' | 'write';
    configFile?: string;
    projectRoot?: string;
    recursive?: boolean;
    system?: ts.System;
    logger?: Logger;
    includeDts?: boolean;
    filter: 'file' | 'export' | 'none';
};
export declare const tsr: ({ entrypoints, mode, configFile, projectRoot, recursive, system, logger, includeDts, filter, }: Config) => Promise<void>;
