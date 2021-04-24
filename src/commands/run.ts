import { Message } from 'discord.js';
import { transpile } from 'typescript';
import { instance } from '..';
import { SystemCommandBuilder } from '../CommandBuilder';

const helpMessage = `
__Run a code that you have sent!__
There are several ways that it will recognize.

1. Just puitting in \`run\` in your message will work.

2. Use _code block_ for to recognize what language you used.
   (If you didn't use code block than it will fall back to use \`javascript\`)

3. You can also include multiple code block in one message.
   (One block will execute one script)

4. _If_ you forgot to put \`run\` in your message, reply with the message and send \`run\`
`;

new SystemCommandBuilder()
    .setName('run')
    .setDescription(helpMessage)
    .setFunction(run)
    .buildAndRegister();

const codeBlockRegex = /^`{3}(?<lang>[a-z]+)\n(?<code>[\s\S]+)\n`{3}$/mu;

function run(message: Message, args: string[]) {
    for (const arg of args) {
        if (!codeBlockRegex.test(arg)) {
            instance.evalManager.evaluateOnce(message, transpile(arg), 'js');
        } else {
            const codeblock = codeBlockRegex.exec(arg)?.groups ?? {};
            switch (codeblock.lang.toLowerCase()) {
                case 'js':
                case 'javascript':
                case 'ts':
                case 'typescript':
                    instance.evalManager.evaluateOnce(message, transpile(codeblock.code), 'js');
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
