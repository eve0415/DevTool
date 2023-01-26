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

  protected override createMessage(contents: unknown[]): BaseMessageOptions {
    const processed = this.processContent(contents)
      .map(c =>
        // eslint-disable-next-line no-control-regex
        c.replaceAll(
          /[\u001b\u009b][[()#;?]*(?:[0-9]{1,4}(?:;[0-9]{0,4})*)?[0-9A-ORZcf-nqry=><]/g,
          ''
        )
      )
      .filter(
        c => !c.includes('Could not open history file') || !/^\.{2,}$/.test(c)
      );
    return super.createMessage(processed);
  }
}
