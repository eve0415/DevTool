import { spawn } from 'child_process';
import { ReplyMessageOptions } from 'discord.js';
import treeKill from 'tree-kill';
import { BaseEvaluationSystem } from './base';
import { Language } from '../interface';

export class TypeScriptEvaluationSystem extends BaseEvaluationSystem {
    public evaluate(content: string): Promise<ReplyMessageOptions> {
        return new Promise(res => {
            const result: unknown[] = [];
            const child = spawn(
                process.platform === 'win32'
                    ? 'ts-node'
                    : './node_modules/.bin/ts-node',
                ['-p', '-i'],
                { shell: true, env: { TZ: process.env.TZ } },
            );
            child.stdout.setEncoding('utf8');
            child.stderr.setEncoding('utf8');
            child.stdout.on('data', data => result.push(data));
            child.stderr.on('data', data => {
                this.embedColor = 'RED';
                result.push(data);
            });
            child.on('error', err => res(this.createErrorMessage(err)));
            child.on('close', () => res(this.createMessage(result, 'ts')));
            child.stdin.write(`${content}\n\n.exit\n`);
            setTimeout(() => {
                treeKill(child.pid ?? 100, 'SIGKILL');
                this.embedColor = 'DARK_RED';
                result.push('10秒を超過して実行することはできません');
            }, 10000);
        });
    }

    protected createMessage(contents: unknown[], lang: Language): ReplyMessageOptions {
        const processed = this.processContent(contents).map(c =>
            // eslint-disable-next-line no-control-regex
            c.replaceAll(/[\u001b\u009b][[()#;?]*(?:[0-9]{1,4}(?:;[0-9]{0,4})*)?[0-9A-ORZcf-nqry=><]/g, ''),
        ).filter(c => !c.includes('Could not open history file') || !/^\.{2,}$/.test(c));
        return super.createMessage(processed, lang);
    }
}
