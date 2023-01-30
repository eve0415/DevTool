import type { BaseMessageOptions } from 'discord.js';
import type { CompilerOptions } from 'typescript';
import ts from 'typescript';
import { BaseEvaluationSystem } from './base';
import { JavaScriptEvaluationSystem } from './javascript';
import tsconfig from '../../tsconfig.json';

export class TypeScriptEvaluationSystem extends BaseEvaluationSystem {
  public override evaluate(content: string): Promise<BaseMessageOptions> {
    return new Promise(res => {
      const script = ts.transpileModule(content, {
        ...tsconfig,
        compilerOptions: {
          ...(tsconfig.compilerOptions as unknown as CompilerOptions),
          noImplicitUseStrict: true,
          alwaysStrict: false,
          strict: false,
        },
      });
      res(new JavaScriptEvaluationSystem().evaluate(script.outputText));
    });
  }
}
