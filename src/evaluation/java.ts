import type { BaseMessageOptions } from 'discord.js';
import { BaseEvaluationSystem } from './base';

export class JavaEvaluationSystem extends BaseEvaluationSystem {
  public override evaluate(content: string): Promise<BaseMessageOptions> {
    return super.evaluate(`${content}\n\n/exit\n`, 'jshell', ['-q']);
  }
}
