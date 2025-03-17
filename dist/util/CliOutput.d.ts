import { Logger } from './Logger.js';
import { Output } from './Output.js';
export declare class CliOutput implements Output {
    #private;
    constructor({ logger, projectRoot, mode, }: {
        logger: Logger;
        projectRoot: string;
        mode: 'check' | 'write';
    });
    deleteFile(file: string): void;
    removeExport({ file, position, code, content, }: {
        file: string;
        position: number;
        code: string;
        content: string;
    }): void;
    done(): {
        code: number;
    };
}
