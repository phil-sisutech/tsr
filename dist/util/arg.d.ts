import mri from 'mri';
type Value = {
    string: string;
    boolean: boolean;
};
type Parsed<T extends Option> = T extends {
    name: infer K extends string;
} ? {
    [key in K]: Value[T['type']];
} : never;
type UnionToIntersection<U> = (U extends any ? (k: U) => void : never) extends (k: infer I) => void ? I : never;
type Option = {
    name: string;
    alias?: string;
    type: 'string';
    default: string;
} | {
    name: string;
    alias?: string;
    type: 'boolean';
    default: boolean;
};
export declare const arg: <T extends Readonly<Option[]>>(options: T) => {
    parse: (args: string[]) => mri.Argv<UnionToIntersection<Parsed<T[number]>> extends infer T_1 ? { [K in keyof T_1]: UnionToIntersection<Parsed<T[number]>>[K]; } : never>;
};
export {};
