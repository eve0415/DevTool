import type { ReplyMessageOptions } from 'discord.js';
import { BaseEvaluationSystem } from './base';

export class PythonEvaluationSystem extends BaseEvaluationSystem {
    public override evaluate(content: string): Promise<ReplyMessageOptions> {
        return super.evaluate(
            `${content}\n\nexit()\n`,
            process.platform === 'win32'
                ? 'python'
                : 'python3',
            ['-i', '-I'],
        );
    }

    protected override createMessage(contents: unknown[]): ReplyMessageOptions {
        const processed = this.processContent(contents).filter(c => !/^Python.+on.+$/s.test(c));
        return super.createMessage(processed);
    }
}
