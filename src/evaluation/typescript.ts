import type { Language } from '../interface';
import type { ReplyMessageOptions } from 'discord.js';
import type { CompilerOptions } from 'typescript';
import { transpileModule } from 'typescript';
import { BaseEvaluationSystem } from './base';
import { JavaScriptEvaluationSystem } from './javascript';
import tsconfig from '../../tsconfig.json';

export class TypeScriptEvaluationSystem extends BaseEvaluationSystem {
    public evaluate(content: string): Promise<ReplyMessageOptions> {
        return new Promise(res => {
            const script = transpileModule(content, {
                ...tsconfig,
                compilerOptions: {
                    ...tsconfig.compilerOptions,
                    noImplicitUseStrict: true,
                    alwaysStrict: false,
                    strict: false
                } as any
            });
            res(new JavaScriptEvaluationSystem().evaluate(script.outputText));
        });
    }

    protected override createMessage(contents: unknown[], lang: Language): ReplyMessageOptions {
        const processed = this.processContent(contents).map(c =>
            // eslint-disable-next-line no-control-regex
            c.replaceAll(/[\u001b\u009b][[()#;?]*(?:[0-9]{1,4}(?:;[0-9]{0,4})*)?[0-9A-ORZcf-nqry=><]/g, ''),
        ).filter(c => !c.includes('Could not open history file') || !/^\.{2,}$/.test(c));
        return super.createMessage(processed, lang);
    }
}
