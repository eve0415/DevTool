import type { BaseMessageOptions } from 'discord.js';
import { inspect } from 'util';
import { BaseEvaluationSystem } from './base';

export class JavaScriptEvaluationSystem extends BaseEvaluationSystem {
  public override evaluate(content: string): Promise<BaseMessageOptions> {
    return super.evaluate(
      `;\n${this.patchContent(content)}\n\n.exit\n`,
      process.execPath,
      [
        '--max-old-space-size=50',
        '--experimental-import-meta-resolve',
        '--experimental-json-modules',
        '--experimental-top-level-await',
        '--experimental-vm-modules',
        '--disallow-code-generation-from-strings',
        '-e',
        'repl.start({ useGlobal: true, breakEvalOnSigint: true, prompt: "" })',
      ]
    );
  }

  protected override processContent(content: unknown[]): string[] {
    return content
      .map(c =>
        typeof c === 'string'
          ? c
          : inspect(c, { depth: null, maxArrayLength: null })
      )
      .slice(1)
      .flatMap(s => s.split('\\n'))
      .map(s => s.trimEnd())
      .filter(s => s !== '...');
  }

  private patchContent(input: string): string {
    return input.replaceAll(/process.kill\(.+?\)/g, 'process.kill()');
  }
}
