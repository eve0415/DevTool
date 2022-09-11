import type { Language } from '../interface';
import type { ReplyMessageOptions } from 'discord.js';
import { spawn } from 'child_process';
import { Colors } from 'discord.js';
import treeKill from 'tree-kill';
import { BaseEvaluationSystem } from './base';

export class CSharpEvaluationSystem extends BaseEvaluationSystem {
    public evaluate(content: string): Promise<ReplyMessageOptions> {
        return new Promise(res => {
            const child = spawn(
                'csi',
                { shell: true, env: { TZ: process.env.TZ } },
            );
            child.stdout.setEncoding('utf8');
            child.stderr.setEncoding('utf8');
            child.stdout.on('data', data => {
                this.result.push(data);
            });
            child.stderr.on('data', data => {
                if (this.result.push(data) === 1) this.kill(child.pid ?? 100);
            });
            child.on('error', err => res(this.createErrorMessage(err)));
            child.on('close', () => res(this.createMessage(this.result, 'cs')));
            child.stdin.end(`${content}\nEnvironment.Exit(0);\n`);
            setTimeout(() => {
                treeKill(child.pid ?? 100, 'SIGKILL');
                this.embedColor = Colors.DarkRed;
                this.result.push('10秒を超過して実行することはできません');
            }, 10000);
        });
    }

    protected override createMessage(contents: unknown[], lang: Language): ReplyMessageOptions {
        return super.createMessage(contents.slice(3), lang);
    }
}
