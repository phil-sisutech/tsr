export declare const memoize: <T extends (...args: any[]) => any>(fn: T, { key }: {
    key: (...args: Parameters<T>) => string;
}) => (...args: Parameters<T>) => ReturnType<T>;
