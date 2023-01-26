import type { BaseMessageOptions } from 'discord.js';
import { BaseEvaluationSystem } from './base';

export class PythonEvaluationSystem extends BaseEvaluationSystem {
  public override evaluate(content: string): Promise<BaseMessageOptions> {
    return super.evaluate(
      `${content}\n\nexit()\n`,
      process.platform === 'win32' ? 'python' : 'python3',
      ['-i', '-I']
    );
  }

  protected override createMessage(contents: unknown[]): BaseMessageOptions {
    const processed = this.processContent(contents).filter(
      c => !/^Python.+on.+$/s.test(c)
    );
    return super.createMessage(processed);
  }
}
