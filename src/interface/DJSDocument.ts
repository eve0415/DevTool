// eslint-disable-next-line @typescript-eslint/naming-convention
export interface DJSDocument {
    classes: {
        name: string;
        description: string;
        internal_type: 'class';
        props?: string[];
        methods?: string[];
        events?: string[];
    }[];
    typedefs: {
        name: string;
        description: string;
        internal_type: 'typedef';
        type: string;
    }[];
    interfaces: {
        name: string;
        description: string;
        internal_type: 'typedef';
        props?: string[];
        methods: string[];
    }[];
}
