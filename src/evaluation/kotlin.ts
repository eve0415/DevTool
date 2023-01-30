import type { BaseMessageOptions } from 'discord.js';
import { BaseEvaluationSystem } from './base';

export class KotlinEvaluationSystem extends BaseEvaluationSystem {
  public override evaluate(content: string): Promise<BaseMessageOptions> {
    return super.evaluate(`${content}\n\n:quit\n`, 'kotlin');
  }
}
