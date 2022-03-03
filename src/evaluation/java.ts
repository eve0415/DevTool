import type { ReplyMessageOptions } from 'discord.js';
import { spawn } from 'child_process';
import { BaseEvaluationSystem } from './base';

export class JavaEvaluationSystem extends BaseEvaluationSystem {
    public evaluate(content: string): Promise<ReplyMessageOptions> {
        return new Promise(res => {
            const child = spawn('jshell',
                ['-q'],
                { env: { TZ: process.env.TZ } },
            );
            child.stdout.setEncoding('utf8');
            child.stderr.setEncoding('utf8');
            child.stdout.on('data', data => {
                if (this.result.push(data) === 1) this.kill(child.pid ?? 100);
            });
            child.stderr.on('data', data => {
                this.embedColor = 'RED';
                if (this.result.push(data) === 1) this.kill(child.pid ?? 100);
            });
            child.on('error', err => res(this.createErrorMessage(err)));
            child.on('close', () => res(this.createMessage(this.result, 'js')));
            child.stdin.write(`${content}\n\n/exit\n`);
        });
    }
}
