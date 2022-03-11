/* eslint-disable @typescript-eslint/naming-convention */

export interface DJSRawDocument {
    meta: {
        generator: string;
        format: number;
        date: number;
    };
    custom: {
        general: {
            name: string;
            files: {
                welcome: {
                    name: string;
                    type: string;
                    content: string;
                    path: string;
                };
            };
        };
    };
    classes: Class[];
    interfaces: Interface[];
    typedefs: Typedef[];
    externals: {
        name: string;
        see: string[];
        meta: Meta;
    }[];
}

export interface Class {
    name: string;
    description: string;
    extends?: string[][][];
    props?: {
        name: string;
        description?: string;
        type: string[][][];
        meta: Meta;
        access?: 'private';
        readonly?: true;
        nullable?: true;
        abstract?: boolean;
        see?: string[];
        deprecated?: boolean | string;
        props?: PropElement[];
        scope?: 'static';
    }[];
    methods?: {
        name: string;
        description: string;
        returns?: TentacledReturns;
        meta: Meta;
        access?: 'private';
        examples?: string[];
        params?: ParamElement[];
        async?: boolean;
        inherits?: string;
        inherited?: boolean;
        implements?: string[];
        see?: string[];
        scope?: 'static';
        emits?: string[];
        deprecated?: string;
        abstract?: boolean;
    }[];
    events?: {
        name: string;
        description: string;
        params?: Params[];
        meta: Meta;
        deprecated?: string;
    }[];
    meta: Meta;
    construct?: {
        name: string;
        params: PropElement[];
    };
    implements?: string[][][];
    abstract?: boolean;
    access?: 'private';
}

interface Interface {
    name: string;
    description: string;
    methods: {
        name: string;
        description: string;
        examples?: string[];
        params?: PropElement[];
        async?: boolean;
        returns: string[][][] | Returns;
        meta: Meta;
        see?: string[];
    }[];
    meta: Meta;
    props?: {
        name: string;
        description: string;
        type: string[][][];
        meta: Meta;
        nullable?: true;
        readonly?: true;
    }[];
}

interface Typedef {
    name: string;
    description?: string;
    type: string[][][];
    props?: ParamElement[];
    meta: Meta;
    see?: string[];
    params?: Params[];
    returns?: string[][][] | Returns;
    access?: 'private';
}

interface PropElement {
    name: string;
    description: string;
    type: string[][][];
    optional?: boolean;
    default?: unknown;
    nullable?: true;
}

interface Meta {
    line: number;
    file: string;
    path: string;
}

interface Params {
    name: string;
    description: string;
    type: TypeElement[][];
    nullable?: true;
    variable?: boolean;
}

type TypeElement = string[] | '*';

interface ParamElement {
    name: string;
    description: string;
    optional?: boolean;
    default?: FluffyDefault;
    type: TypeElement[][];
    nullable?: true;
    variable?: boolean;
}

type FluffyDefault = boolean | number | null | string;

type TentacledReturns = TypeElement[][] | {
    types: TypeElement[][];
    description?: string;
    nullable?: true;
};

interface Returns {
    types: string[][][];
    description: string;
}
