import type { Language } from '../interface';
import type { ReplyMessageOptions } from 'discord.js';
import { spawn } from 'child_process';
import { inspect } from 'util';
import { Colors } from 'discord.js';
import treeKill from 'tree-kill';
import { BaseEvaluationSystem } from './base';

export class PythonEvaluationSystem extends BaseEvaluationSystem {
    public evaluate(content: string): Promise<ReplyMessageOptions> {
        return new Promise(res => {
            const child = spawn(
                process.platform === 'win32'
                    ? 'python'
                    : 'python3',
                ['-i', '-I'],
                { shell: true, env: { TZ: process.env.TZ } },
            );
            child.stdout.setEncoding('utf8');
            child.stderr.setEncoding('utf8');
            let inputted = false;
            const handler = (data: unknown) => {
                if (inputted) {
                    this.result.push(data);
                    return;
                }
                if (`${data}`.startsWith('>>>')) {
                    inputted = true;
                    child.stdin.end(`import sys; sys.ps1 = ""; sys.ps2 = ""\n${content}\n`);
                    this.kill(child.pid ?? 100);
                }
            };
            child.stdout.on('data', handler);
            child.stderr.on('data', handler);
            child.on('error', err => res(this.createErrorMessage(err)));
            child.on('close', () => res(this.createMessage(this.result, 'ts')));
            setTimeout(() => {
                treeKill(child.pid ?? 100, 'SIGKILL');
                this.embedColor = Colors.DarkRed;
                this.result.push('10秒を超過して実行することはできません');
            }, 10000);
        });
    }

    protected override processContent(content: unknown[]): string[] {
        return content
            .map(c => typeof c === 'string' ? c : inspect(c, { depth: null, maxArrayLength: null }))
            .flatMap(s => s.split('\n'))
            .map(s => s.trimEnd());
    }

    protected override createMessage(contents: unknown[], lang: Language): ReplyMessageOptions {
        const processed = this.processContent(contents);
        return super.createMessage(processed, lang);
    }
}
