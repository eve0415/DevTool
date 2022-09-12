import type { ReplyMessageOptions } from 'discord.js';
import { BaseEvaluationSystem } from './base';

export class JavaEvaluationSystem extends BaseEvaluationSystem {
    public override evaluate(content: string): Promise<ReplyMessageOptions> {
        return super.evaluate(`${content}\n\n/exit\n`, 'jshell', ['-q']);
    }
}
