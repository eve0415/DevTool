import type { DevToolBot } from '../DevToolBot';
import type { CommandInteraction } from 'discord.js';
import { getHelp } from '../helper';
import { Command } from '../interface';

export default class extends Command {
    public constructor(client: DevToolBot) {
        super(client, {
            type: 'CHAT_INPUT',
            name: 'help',
            description: 'このボットの使い方の説明',
        });
    }

    public async run(interaction: CommandInteraction): Promise<void> {
        await interaction.reply(getHelp('interaction'));
    }

    public autoCompletion(): Promise<never> {
        return Promise.reject(new Error('This command does not support auto completion'));
    }
}
