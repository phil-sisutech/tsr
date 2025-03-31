export declare class Graph<T = undefined> {
    #private;
    vertexes: Map<string, {
        to: Set<string>;
        from: Set<string>;
        data: T;
    }>;
    constructor(...args: T extends undefined ? never[] : [() => T]);
    private addVertex;
    deleteVertex(vertex: string): void;
    addEdge(source: string, destination: string): void;
}
