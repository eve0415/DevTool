import { Message } from 'discord.js';
import { ScriptTarget, transpile } from 'typescript';
import { instance } from '..';
import { SystemCommandBuilder } from '../api';

new SystemCommandBuilder()
    .setName('run')
    .setDescription('Run a script that you sent!')
    .setFunction(run)
    .buildAndRegister();

const codeBlockRegex = /^`{3}(?<lang>[a-z]+)\n(?<code>[\s\S]+)\n`{3}$/mu;

function run(message: Message, args: string[]) {
    for (const arg of args) {
        if (!codeBlockRegex.test(arg)) {
            instance.evalManager.evaluateOnce(message, transpile(arg, { allowJs: true, importHelpers: false, target: ScriptTarget.ES2020 }), 'js');
        } else {
            const codeblock = codeBlockRegex.exec(arg)?.groups ?? {};
            switch (codeblock.lang.toLowerCase()) {
                case 'js':
                case 'javascript':
                case 'ts':
                case 'typescript':
                    instance.evalManager.evaluateOnce(message, transpile(codeblock.code, { allowJs: true, importHelpers: false, target: ScriptTarget.ES2020 }), 'js');
                    break;

                case 'py':
                case 'python':
                    instance.evalManager.evaluateOnce(message, codeblock.code, 'py');
                    break;

                default:
                    message.reply(`Sorry, language \`${codeblock.lang}\` is not supported`, { allowedMentions: { repliedUser: false } });
                    break;
            }
        }
    }
}
