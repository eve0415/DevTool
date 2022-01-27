import { spawn } from 'child_process';
import type { ReplyMessageOptions } from 'discord.js';
import { BaseEvaluationSystem } from './base';

export class KotlinEvaluationSystem extends BaseEvaluationSystem {
    public evaluate(content: string): Promise<ReplyMessageOptions> {
        return new Promise(res => {
            if (process.platform === 'win32') return res({ content: 'Windows では使えません' });
            const child = spawn('kotlinc',
                ['-jvm-target 16'],
                { cwd: '/app/kotlinc/bin' },
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
            child.on('close', () => res(this.createMessage(this.result, 'kt')));
            child.stdin.write(`${content}\n\n:quit\n`);
        });
    }
}
