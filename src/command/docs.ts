import type { DevToolBot } from '../DevToolBot';
import type { DJSDocument } from '../interface';
import type { AutocompleteInteraction, CommandInteraction, MessageEmbed } from 'discord.js';
import axios from 'axios';
import Fuse from 'fuse.js';
import { Command } from '../interface';

export default class extends Command {
    private docs: Fuse<string> | null = null;

    public constructor(protected override readonly client: DevToolBot) {
        super(client, {
            type: 'CHAT_INPUT',
            name: 'docs',
            description: 'discord.js のドキュメントを表示します',
            options: [{
                type: 'STRING',
                name: 'query',
                description: '検索したい単語を入力してください',
                autocomplete: true,
                required: true,
            }],
        });

        this.fetchDocs()
            .catch(e => this.logger.error(e))
            .finally(() => setInterval(() => this.fetchDocs().catch(e => this.logger.error(e)), 1000 * 60 * 60 * 3));
    }

    private async fetchDocs(): Promise<void> {
        const stable = await axios.get<DJSDocument>('https://djsdocs.sorta.moe/v2', { params: { src: 'stable' } });
        const collection = await axios.get<DJSDocument>('https://djsdocs.sorta.moe/v2', { params: { src: 'collection' } });

        this.docs = new Fuse([
            ...stable.data.classes.flatMap(c => {
                const res = [c.name];
                if (c.props) res.push(...c.props.map(p => `${c.name}#${p}`));
                if (c.methods) res.push(...c.methods.map(m => `${c.name}#${m}`));
                if (c.events) res.push(...c.events.map(e => `${c.name}#${e}`));
                return res;
            }),
            ...stable.data.typedefs.map(t => t.name),
            ...stable.data.interfaces.flatMap(i => {
                const res = [i.name];
                if (i.props) res.push(...i.props.flatMap(p => `${i.name}#${p}`));
                res.push(...i.methods.flatMap(m => `${i.name}#${m}`));
                return res;
            }),
            ...collection.data.classes.flatMap(c => {
                const res = [c.name];
                if (c.methods) res.push(...c.methods.map(m => `${c.name}#${m}`));
                return res;
            }),
        ]);
    }

    public async run(interaction: CommandInteraction): Promise<void> {
        await interaction.deferReply();

        const input = interaction.options.getString('query', true);
        const response = await axios.get<MessageEmbed>('https://djsdocs.sorta.moe/v2/embed', {
            params: { src: input.startsWith('Collection') ? 'collection' : 'stable', q: input },
        });
        await interaction.editReply({ embeds: [response.data] });
    }

    public async autoCompletion(interaction: AutocompleteInteraction): Promise<void> {
        if (!this.docs) return;

        const input = `${interaction.options.getFocused()}`.replaceAll('.', '#');
        const search = this.docs.search(input, { limit: 25 });

        await interaction.respond(search.map(s => ({ name: s.item, value: s.item })));
    }
}
