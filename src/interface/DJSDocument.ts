/* eslint-disable @typescript-eslint/naming-convention */

export type DJSDocument =
    DJSClassDocument |
    DJSPropDocument |
    DJSMethodDocument |
    DJSInterfaceDocument |
    DJSTypedefDocument |
    DJSExternalDocument;

export interface DJSBaseDocument {
    name: string;
    url: string;
    description: string;
}

export interface DJSClassDocument extends DJSBaseDocument {
    docType: 'class';
    extends?: string;
    implements?: string[];
    abstract: boolean;
    construct?: {
        name: string;
        description: string;
        type: string;
        optional: boolean;
        default?: string;
        nullable: boolean;
    }[];
}

export interface DJSPropDocument extends DJSBaseDocument {
    docType: 'prop';
    type: string[];
    optional: boolean;
    private: boolean;
    readonly: boolean;
    nullable: boolean;
    deprecated: boolean | string;
    see?: string;
}

export interface DJSMethodDocument extends DJSBaseDocument {
    docType: 'method';
    implements?: string[];
    examples?: string[];
    inherits: string;
    static: boolean;
    private: boolean;
    async: boolean;
    returns: string;
    returnDesc?: string;
}

export interface DJSInterfaceDocument extends DJSBaseDocument {
    docType: 'interface';
}

export interface DJSTypedefDocument extends DJSBaseDocument {
    docType: 'typedef';
    type: string;
}

export interface DJSExternalDocument {
    name: string;
    docType: 'external';
    link: string;
}
