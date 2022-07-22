import type { Language } from '../interface';
import type { ReplyMessageOptions } from 'discord.js';
import { spawn } from 'child_process';
import { Colors } from 'discord.js';
import { BaseEvaluationSystem } from './base';

export class KotlinEvaluationSystem extends BaseEvaluationSystem {
    public evaluate(content: string): Promise<ReplyMessageOptions> {
        return new Promise(res => {
            if (process.platform === 'win32') return res({ content: 'Windows では使えません' });
            const child = spawn('kotlinc-jvm');
            child.stdout.setEncoding('utf8');
            child.stderr.setEncoding('utf8');
            child.stdout.on('data', data => {
                if (this.result.push(data) === 1) this.kill(child.pid ?? 100);
            });
            child.stderr.on('data', data => {
                this.embedColor = Colors.Red;
                if (this.result.push(data) === 1) this.kill(child.pid ?? 100);
            });
            child.on('error', err => res(this.createErrorMessage(err)));
            child.on('close', () => res(this.createMessage(this.result, 'kt')));
            child.stdin.write(`${content}\n\n:quit\n`);
        });
    }

    protected override createMessage(contents: unknown[], lang: Language): ReplyMessageOptions {
        const processed = this.processContent(contents).map(c =>
            // eslint-disable-next-line no-control-regex
            c.replaceAll(/[\u001b\u009b][[()#;?]*(?:[0-9]{1,4}(?:;[0-9]{0,4})*)?[0-9A-ORZcf-nqry=><]/g, ''),
        );
        return super.createMessage(processed, lang);
    }
}
