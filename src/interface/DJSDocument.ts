/* eslint-disable @typescript-eslint/naming-convention */

export type DJSDocument =
    DJSClassDocument |
    DJSPropDocument |
    DJSMethodDocument |
    DJSEventDocument |
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
    abstract: boolean;
    static: boolean;
    private: boolean;
    readonly: boolean;
    nullable: boolean;
    deprecated: boolean | string;
    default?: string;
    see?: string;
}

export interface DJSMethodDocument extends DJSBaseDocument {
    docType: 'method';
    implements?: string[];
    examples?: string[];
    inherits?: string;
    abstract: boolean;
    static: boolean;
    deprecated?: string;
    private: boolean;
    async: boolean;
    params?: DJSParam[];
    returns?: string;
    returnDesc?: string;
}

export interface DJSEventDocument extends DJSBaseDocument {
    docType: 'event';
    params?: DJSParam[];
    deprecated?: string;
}

export interface DJSInterfaceDocument extends DJSBaseDocument {
    docType: 'interface';
}

export interface DJSTypedefDocument extends DJSBaseDocument {
    docType: 'typedef';
    type: string;
    private: boolean;
    returns?: string;
    returnDesc?: string;
    see?: string;
}

export interface DJSExternalDocument extends DJSBaseDocument {
    docType: 'external';
}

interface DJSParam {
    name: string;
    description: string;
    type: string[];
}
