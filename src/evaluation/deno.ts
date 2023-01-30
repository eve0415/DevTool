import type { BaseMessageOptions } from 'discord.js';
import { BaseEvaluationSystem } from './base';

export class DenoEvaluationSystem extends BaseEvaluationSystem {
  public override evaluate(content: string): Promise<BaseMessageOptions> {
    return super.evaluate(`${content}\n\nclose()\n`, 'deno', ['repl']);
  }

  protected override processContent(content: unknown[]): string[] {
    return super.processContent(content).slice(1);
  }
}
