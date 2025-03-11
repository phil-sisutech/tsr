import ts from 'typescript';
import { Logger } from './util/Logger.js';

export { tsr } from './tsr.js';
export { Logger } from './util/Logger.js';
export * from './util/error.js';
export type Config = {
  entrypoints: RegExp[];
  mode: 'check' | 'write';
  configFile?: string;
  projectRoot?: string;
  recursive?: boolean;
  system?: ts.System;
  logger?: Logger;
  includeDts?: boolean;
};
