import axios from 'axios';
import type { CommandInteraction, MessageEmbed } from 'discord.js';
import type { DevToolBot } from '../DevToolBot';
import { Command } from '../interface';

export default class extends Command {
    public constructor(protected override readonly client: DevToolBot) {
        super(client, {
            type: 'CHAT_INPUT',
            name: 'docs',
            description: 'discord.js のドキュメントを表示します',
            options: [{
                type: 'STRING',
                name: 'query',
                description: '検索したい単語を入力してください',
                required: true,
            }],
        });
    }

    public async run(interaction: CommandInteraction): Promise<void> {
        await interaction.deferReply();

        console.log(interaction);

        const response = await axios.get<MessageEmbed>('https://djsdocs.sorta.moe/v2/embed', {
            params: { src: 'stable', q: interaction.options.getString('query', true) },
        });
        await interaction.editReply({ embeds: [response.data] });
    }
}
