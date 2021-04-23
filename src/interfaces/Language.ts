export type PLanguage = 'js' | 'py';

interface SafeManual {
    readonly lang: PLanguage
    readonly exit: string
    readonly ignore: string[]
}

export const processData: Readonly<SafeManual[]> = [
    {
        lang: 'js',
        exit: '.exit',
        ignore: ['...'],
    },
    {
        lang: 'py',
        exit: 'exit()',
        ignore: ['>>>'],
    },
];
