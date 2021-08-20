import { spawn } from 'child_process';
import { ReplyMessageOptions } from 'discord.js';
import treeKill from 'tree-kill';
import { BaseEvaluationSystem } from './base';
import { Language } from '../interface';

export class PythonEvaluationSystem extends BaseEvaluationSystem {
    public evaluate(content: string): Promise<ReplyMessageOptions> {
        return new Promise(res => {
            const result: unknown[] = [];
            const child = spawn(
                process.platform === 'win32'
                    ? 'python'
                    : 'python3',
                ['-i', '-I'],
                { shell: true },
            );
            child.stdout.setEncoding('utf8');
            child.stderr.setEncoding('utf8');
            child.stdout.on('data', data => result.push(data));
            child.stderr.on('data', data => result.push(data));
            child.on('error', err => res(this.createErrorMessage(err)));
            child.on('close', () => res(this.createMessage(result, 'ts')));
            child.stdin.write(`${content}\n\nexit()\n`);
            setTimeout(() => {
                treeKill(child.pid ?? 100, 'SIGKILL');
                this.embedColor = 'DARK_RED';
                result.push('10秒を超過して実行することはできません');
            }, 10000);
        });
    }

    protected createMessage(contents: unknown[], lang: Language): ReplyMessageOptions {
        const processed = this.processContent(contents).filter(c => !/^Python.+on.+$/s.test(c));
        return super.createMessage(processed, lang);
    }
}
