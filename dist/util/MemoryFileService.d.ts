import { FileService } from './FileService.js';
export declare class MemoryFileService implements FileService {
    #private;
    constructor(initialFiles?: Iterable<[string, string]>);
    set(name: string, content: string): void;
    get(name: string): string;
    delete(name: string): void;
    getVersion(name: string): string;
    getFileNames(): Set<string>;
    exists(name: string): boolean;
    eject(): Map<string, string>;
}
