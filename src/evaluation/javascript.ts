import { spawn } from 'child_process';
import { ReplyMessageOptions } from 'discord.js';
import treeKill from 'tree-kill';
import { BaseEvaluationSystem } from './base';

export class JavaScriptEvaluationSystem extends BaseEvaluationSystem {
    public evaluate(content: string): Promise<ReplyMessageOptions> {
        return new Promise(res => {
            const result: unknown[] = [];
            const child = spawn('node',
                [
                    '-i',
                    '--experimental-vm-modules',
                    '--experimental-repl-await',
                    '--experimental-import-meta-resolve',
                    '--experimental-json-modules',
                    '--disallow-code-generation-from-strings',
                ],
                { env: { TZ: process.env.TZ } },
            );
            child.stdout.setEncoding('utf8');
            child.stderr.setEncoding('utf8');
            child.stdout.on('data', data => result.push(data));
            child.stderr.on('data', data => {
                this.embedColor = 'RED';
                result.push(data);
            });
            child.on('error', err => res(this.createErrorMessage(err)));
            child.on('close', () => res(this.createMessage(result, 'js')));
            child.stdin.write(`${content}\n\n.exit\n`);
            setTimeout(() => {
                treeKill(child.pid ?? 100, 'SIGKILL');
                this.embedColor = 'DARK_RED';
                result.push('10秒を超過して実行することはできません');
            }, 10000);
        });
    }
}
