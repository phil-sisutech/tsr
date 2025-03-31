import { Graph } from './Graph.js';
export declare class DependencyGraph extends Graph<{
    depth: number;
}> {
    constructor();
    eject(): Map<string, {
        to: Set<string>;
        from: Set<string>;
        data: {
            depth: number;
        };
    }>;
}
export type Vertexes = ReturnType<DependencyGraph['eject']>;
