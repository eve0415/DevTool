import type { ReplyMessageOptions } from 'discord.js';
import { spawn } from 'child_process';
import { inspect } from 'util';
import { Colors } from 'discord.js';
import { BaseEvaluationSystem } from './base';

export class JavaScriptEvaluationSystem extends BaseEvaluationSystem {
    public evaluate(content: string): Promise<ReplyMessageOptions> {
        return new Promise(res => {
            const child = spawn('node',
                [
                    '-e',
                    'repl.start({ useGlobal: true, breakEvalOnSigint: true, prompt: "" })',
                    '--abort-on-uncaught-exception',
                    '--max-old-space-size=50',
                    '--experimental-import-meta-resolve',
                    '--experimental-json-modules',
                    '--experimental-top-level-await',
                    '--experimental-vm-modules',
                    '--disallow-code-generation-from-strings',
                ],
                { env: { TZ: process.env.TZ } },
            );
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
            child.on('close', () => res(this.createMessage(this.result, 'js')));
            child.stdin.write(`;\n${this.patchContent(content)}\n\n.exit\n`);
            child.stdin.end();
        });
    }

    protected override processContent(content: unknown[]): string[] {
        return content
            .map(c => typeof c === 'string' ? c : inspect(c, { depth: null, maxArrayLength: null }))
            .slice(1)
            .flatMap(s => s.split('\\n'))
            .map(s => s.trimEnd());
    }

    private patchContent(input: string): string {
        return input.replaceAll(/process.kill\(.+?\)/g, 'process.kill()');
    }
}
