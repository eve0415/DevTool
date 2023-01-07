import type { BaseMessageOptions } from 'discord.js';
import { BaseEvaluationSystem } from './base';

export class KotlinEvaluationSystem extends BaseEvaluationSystem {
    public override evaluate(content: string): Promise<BaseMessageOptions> {
        return super.evaluate(`${content}\n\n:quit\n`, 'sh', ['-c', 'kotlin']);
    }

    protected override createMessage(contents: unknown[]): BaseMessageOptions {
        const processed = this.processContent(contents).map(c =>
            // eslint-disable-next-line no-control-regex
            c.replaceAll(/[\u001b\u009b][[()#;?]*(?:[0-9]{1,4}(?:;[0-9]{0,4})*)?[0-9A-ORZcf-nqry=><]/g, ''),
        );
        return super.createMessage(processed);
    }
}
