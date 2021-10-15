import type { CommandInteraction } from 'discord.js';
import type { DevToolBot } from '../DevToolBot';
import { Command } from '../interface';
import { getHelp } from '../temporary';

export default class extends Command {
    public constructor(protected override readonly client: DevToolBot) {
        super(client, {
            type: 'CHAT_INPUT',
            name: 'help',
            description: 'このボットの使い方の説明',
        });
    }

    public async run(interaction: CommandInteraction): Promise<void> {
        await interaction.reply(getHelp('interaction'));
    }
}
