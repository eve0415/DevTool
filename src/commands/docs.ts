import axios from 'axios';
import {
  buildMemoryStorage,
  defaultHeaderInterpreter,
  defaultKeyGenerator,
  setupCache,
} from 'axios-cache-interceptor';
import type {
  AutocompleteInteraction,
  ChatInputCommandInteraction,
} from 'discord.js';
import {
  ApplicationCommandOptionType,
  ApplicationCommandType,
  Colors,
  EmbedBuilder,
} from 'discord.js';
import Fuse from 'fuse.js';
import { inspect } from 'util';
import type { DevToolBot } from '../DevToolBot';
import type { DJSDocument, DJSRawDocument } from '../interface';
import { Command } from '../interface';

const baseUrl = 'https://discord.js.org/#/docs';
const djsStableBaseUrl = `${baseUrl}/discord.js/stable`;
const collectionStableBaseUrl = `${baseUrl}/collection/stable`;

const abstractDef =
  'Abstract classes can be defined as classes that cannot be instantiated i.e. whose object reference cannot be created and contains within it, one or more abstract methods. An abstract method is a method that can only be declared but has no implementation to it.';
const deprecatedDef =
  'These deprecated features can still be used, but should be used with caution because they are expected to be removed entirely sometime in the future. You should work to remove their use from your code.';
const readonlyDef =
  'Read-only members can be accessed outside the class, but their value cannot be changed.';
const privateDef =
  'The private access modifier ensures that class members are visible only to that class and are not accessible outside the containing class.';
const staticDef =
  "Neither static methods nor static properties can be called on instances of the class. Instead, they're called on the class itself.";

const docsRequest = setupCache(axios.create(), {
  storage: buildMemoryStorage(),
  generateKey: defaultKeyGenerator,
  headerInterpreter: defaultHeaderInterpreter,
});

export default class extends Command {
  private fuse: Fuse<string> | null = null;
  private readonly docs = new Map<string, DJSDocument>();

  public constructor(client: DevToolBot) {
    super(client, {
      type: ApplicationCommandType.ChatInput,
      name: 'docs',
      description: 'discord.js のドキュメントを表示します',
      options: [
        {
          type: ApplicationCommandOptionType.String,
          name: 'query',
          description: '検索したい単語を入力してください',
          autocomplete: true,
          required: true,
        },
      ],
    });

    this.fetchDocs()
      .catch(e => this.logger.error(e))
      .finally(() =>
        setInterval(() => {
          this.fetchDocs().catch(e => this.logger.error(e));
        }, 1000 * 60 * 60 * 3)
      );
  }

  private async fetchDocs(): Promise<void> {
    const { data: djs } = await docsRequest.get<DJSRawDocument>(
      'https://raw.githubusercontent.com/discordjs/docs/main/discord.js/main.json',
      { cache: { etag: true } }
    );
    const { data: collection } = await docsRequest.get<DJSRawDocument>(
      'https://raw.githubusercontent.com/discordjs/docs/main/collection/main.json',
      { cache: { etag: true } }
    );

    this.docs.clear();

    djs.classes.forEach(c => {
      this.docs.set(c.name, {
        docType: 'class',
        name: c.name,
        description: c.description,
        url: `${djsStableBaseUrl}/class/${c.name}`,
        extends: c.extends?.flat(2).join(''),
        implements: c.implements?.flat(2),
        abstract: !!c.abstract,
        construct: c.construct
          ? c.construct.params.map(
              ({
                name,
                description,
                type,
                optional,
                default: def,
                nullable,
              }) => ({
                name,
                description,
                type: type.flat(2).join(''),
                optional: !!optional,
                default: inspect(def),
                nullable: !!nullable,
              })
            )
          : undefined,
      });

      c.props?.forEach(p => {
        this.docs.set(`${c.name}#${p.name}`, {
          docType: 'prop',
          name: p.name,
          description: inspect(p.description),
          url: `${djsStableBaseUrl}/class/${c.name}?scrollTo=${p.name}`,
          type: p.type.flat(2),
          optional: false,
          abstract: !!p.abstract,
          static: p.scope === 'static',
          private: p.access === 'private',
          readonly: !!p.readonly,
          nullable: !!p.nullable,
          deprecated: p.deprecated ?? false,
          see: p.see?.flat(2).join(''),
        });
      });

      c.methods?.forEach(m => {
        this.docs.set(`${c.name}#${m.name}()`, {
          docType: 'method',
          name: m.name,
          description: m.description,
          url: `${djsStableBaseUrl}/class/${c.name}?scrollTo=${m.name}`,
          implements: m.implements?.flat(2),
          deprecated: m.deprecated,
          examples: m.examples,
          inherits: m.inherits,
          abstract: !!m.abstract,
          static: m.scope === 'static',
          private: m.access === 'private',
          params: m.params?.map(({ name, description, type }) => ({
            name,
            description,
            type: type.flat(2),
          })),
          async: !!m.async,
          returns: Array.isArray(m.returns)
            ? m.returns.flat(2).join('')
            : m.returns?.types.flat(2).join(''),
          returnDesc: Array.isArray(m.returns)
            ? undefined
            : m.returns?.description,
        });
      });

      c.events?.forEach(e => {
        this.docs.set(`${c.name}#${e.name}`, {
          docType: 'event',
          name: e.name,
          description: e.description,
          url: `${djsStableBaseUrl}/class/${c.name}?scrollTo=e-${e.name}`,
          params: e.params?.map(({ name, description, type }) => ({
            name,
            description,
            type: type.flat(2),
          })),
          deprecated: e.deprecated,
        });
      });
    });

    djs.interfaces.forEach(i => {
      this.docs.set(i.name, {
        docType: 'interface',
        name: i.name,
        description: i.description,
        url: '',
      });

      i.props?.forEach(p => {
        this.docs.set(`${i.name}#${p.name}`, {
          docType: 'prop',
          name: p.name,
          description: `${p.description}`,
          url: '',
          type: p.type.flat(2),
          abstract: false,
          static: false,
          optional: false,
          private: false,
          readonly: !!p.readonly,
          nullable: !!p.nullable,
          deprecated: false,
        });
      });

      i.methods.forEach(m => {
        this.docs.set(`${i.name}#${m.name}()`, {
          docType: 'method',
          name: m.name,
          description: m.description,
          url: '',
          implements: undefined,
          examples: m.examples,
          inherits: undefined,
          abstract: false,
          static: false,
          private: false,
          params: m.params?.map(({ name, description, type }) => ({
            name,
            description,
            type: type.flat(2),
          })),
          async: !!m.async,
          returns: Array.isArray(m.returns)
            ? m.returns.flat(2).join('')
            : m.returns.types.flat(2).join(''),
          returnDesc: Array.isArray(m.returns)
            ? undefined
            : m.returns.description,
        });
      });
    });

    djs.typedefs.forEach(t => {
      this.docs.set(t.name, {
        docType: 'typedef',
        name: t.name,
        description: inspect(t.description),
        url: `${djsStableBaseUrl}/typedef/${t.name}`,
        type: t.type.flat(2).join(' | '),
        private: t.access === 'private',
        see: t.see?.flat(2).join('\n'),
        returns: Array.isArray(t.returns)
          ? t.returns.flat(2).join('')
          : t.returns?.types.flat(2).join(''),
        returnDesc: Array.isArray(t.returns)
          ? undefined
          : t.returns?.description,
      });

      t.props?.forEach(p => {
        this.docs.set(`${t.name}#${p.name}`, {
          docType: 'prop',
          name: p.name,
          description: `${p.description}`,
          url: `${djsStableBaseUrl}/typedef/${t.name}?scrollTo=${p.name}`,
          type: p.type.flat(2),
          abstract: false,
          static: false,
          optional: !!p.optional,
          private: false,
          readonly: false,
          nullable: !!p.nullable,
          deprecated: false,
          default: inspect(p.default),
        });
      });

      t.params?.forEach(p => {
        this.docs.set(`${t.name}#${p.name}`, {
          docType: 'prop',
          name: p.name,
          description: `${p.description}`,
          url: `${djsStableBaseUrl}/typedef/${t.name}?scrollTo=${p.name}`,
          type: p.type.flat(2),
          abstract: false,
          static: false,
          optional: false,
          private: false,
          readonly: false,
          nullable: !!p.nullable,
          deprecated: false,
        });
      });
    });

    // djs.externals.forEach(e => {
    //     if (e.name === 'Collection') return;
    //     this.docs.set(e.name, {
    //         docType: 'external',
    //         name: e.name,
    //         url: `${e.see[0]}`,
    //         description: '',
    //     });
    // });

    collection.classes.forEach(c => {
      this.docs.set(c.name, {
        docType: 'class',
        name: c.name,
        description: c.description,
        url: `${collectionStableBaseUrl}/class/Collection`,
        extends: c.extends?.flat(2).join(''),
        implements: c.implements?.flat(2),
        abstract: !!c.abstract,
        construct: c.construct
          ? c.construct.params.map(
              ({
                name,
                description,
                type,
                optional,
                default: def,
                nullable,
              }) => ({
                name,
                description,
                type: type.flat(2).join(''),
                optional: !!optional,
                default: inspect(def),
                nullable: !!nullable,
              })
            )
          : undefined,
      });

      c.methods?.forEach(m => {
        this.docs.set(`${c.name}#${m.name}()`, {
          docType: 'method',
          name: m.name,
          description: m.description,
          url: `${collectionStableBaseUrl}/class/Collection?scrollTo=${m.name}`,
          implements: m.implements?.flat(2),
          examples: m.examples,
          inherits: m.inherits,
          abstract: !!m.abstract,
          static: m.scope === 'static',
          private: m.access === 'private',
          params: m.params?.map(({ name, description, type }) => ({
            name,
            description,
            type: type.flat(2),
          })),
          async: !!m.async,
          returns: Array.isArray(m.returns)
            ? m.returns.flat(2).join('')
            : m.returns?.types.flat(2).join(''),
          returnDesc: Array.isArray(m.returns)
            ? undefined
            : m.returns?.description,
        });
      });
    });

    this.fuse = new Fuse([...this.docs.keys()]);
  }

  public async run(interaction: ChatInputCommandInteraction): Promise<void> {
    const query = interaction.options.getString('query', true);
    const docs = this.docs.get(query);
    const embed = new EmbedBuilder();

    const description = [
      docs ? `**${query}**` : '検索結果が見つかりませんでした',
    ];

    if (docs?.description !== 'undefined') {
      description.push('');
      description.push(inspect(docs?.description));
    }

    if (!docs) {
      embed.setColor(Colors.Red).setFooter({ text: `Query: ${query}` });
    } else if (docs.docType === 'class') {
      description[0] = `${inspect(description[0])} ${
        docs.extends ? `extends ${docs.extends}` : ''
      }`;
      description[0] = `${inspect(description[0])} ${
        docs.implements?.length ? `implement ${docs.implements.join(', ')}` : ''
      }`;

      embed.setColor(Colors.Blurple);
      if (docs.construct)
        embed.addFields({
          name: 'Construct',
          value: this.resolveType(
            docs.construct
              .map(
                ({ name, type, optional, default: def, nullable }) =>
                  `**${name}**${optional ? '?' : ''}: ${type}${
                    def ? ` = \`${def}` : ''
                  }${nullable ? ' | null' : ''}\``
              )
              .join('\n')
          ),
        });
      if (docs.abstract) {
        description[0] = `🇦 ${inspect(description[0])}`;
        embed.addFields({
          name: 'Abstract',
          value: `This class is abstract.\n>>> ${abstractDef}`,
          inline: true,
        });
      }
    } else if (docs.docType === 'typedef') {
      embed.setColor(Colors.Green);
      if (docs.see) {
        description.push('');
        description.push(`See: ${docs.see}`);
      }
      embed.addFields({ name: 'Types', value: this.resolveType(docs.type) });
      if (docs.returns)
        embed.addFields({
          name: 'Returns',
          value: `${this.resolveType(docs.returns)}${
            docs.returnDesc ? `\n${docs.returnDesc}` : ''
          }`,
        });
    } else if (docs.docType === 'interface') {
      //
    } else if (docs.docType === 'event') {
      embed.setColor(Colors.Aqua);
      if (docs.params?.length)
        embed.addFields({
          name: 'Params',
          value: this.resolveType(
            docs.params
              .map(
                ({ name, description: desc, type }) =>
                  `**${name}**: ${type.join(' ')}${desc ? `\n${desc}` : ''}`
              )
              .join('\n')
          ),
          inline: true,
        });
      if (docs.deprecated) {
        description[0] = `~~${inspect(description[0])}`;
        description[description.length - 1] = `${inspect(
          description[description.length - 1]
        )}~~`;
        embed.addFields({
          name: 'Deprecated',
          value: this.resolveType(docs.deprecated),
        });
      }
    } else if (docs.docType === 'method') {
      embed.setColor(Colors.Orange);
      if (docs.params?.length)
        embed.addFields({
          name: 'Params',
          value: this.resolveType(
            docs.params
              .map(
                ({ name, description: desc, type }) =>
                  `**${name}**: ${type.join(' ')}${desc ? `\n${desc}` : ''}`
              )
              .join('\n')
          ),
          inline: true,
        });
      if (docs.returns)
        embed.addFields({
          name: 'Returns',
          value: `${this.resolveType(docs.returns)}${
            docs.returnDesc ? `\n${docs.returnDesc}` : ''
          }`,
          inline: true,
        });
      if (docs.deprecated) {
        description[0] = `~~${inspect(description[0])}`;
        description[description.length - 1] = `${inspect(
          description[description.length - 1]
        )}~~`;
        embed.addFields({
          name: 'Deprecated',
          value: this.resolveType(docs.deprecated),
        });
      } else {
        embed.addFields({ name: '​', value: '​' });
      }
      if (docs.abstract) {
        description[0] = `🇦 ${inspect(description[0])}`;
        embed.addFields({
          name: 'Abstract',
          value: `This method is abstract.\n>>> ${abstractDef}`,
          inline: true,
        });
      }
      if (docs.static) {
        description[0] = `🇸 ${inspect(description[0])}`;
        embed.addFields({
          name: '🇸tatic',
          value: `This method is static.\n>>> ${staticDef}`,
          inline: true,
        });
      }
      if (docs.private) {
        description[0] = `🇵 ${inspect(description[0])}`;
        embed.addFields({
          name: '🇵rivate',
          value: `This method is private.\n>>> ${privateDef}`,
          inline: true,
        });
      }
    } else if (docs.docType === 'prop') {
      embed.setColor(Colors.DarkOrange);
      if (docs.see) {
        description.push('');
        description.push(`See: ${docs.see}`);
      }
      embed.addFields({
        name: 'Type',
        value: `${docs.nullable ? '?' : ''}${this.resolveType(
          docs.type.join(' | ')
        )}`,
      });
      if (docs.deprecated) {
        description[0] = `~~${inspect(description[0])}`;
        description[description.length - 1] = `${inspect(
          description[description.length - 1]
        )}~~`;
        embed.addFields({
          name: 'Deprecated',
          value:
            typeof docs.deprecated === 'string'
              ? this.resolveType(docs.deprecated)
              : `This property is deprecated.\n>>> ${deprecatedDef}`,
        });
      }
      if (docs.abstract) {
        description[0] = `🇦 ${inspect(description[0])}`;
        embed.addFields({
          name: 'Abstract',
          value: `This class is abstract.\n>>> ${abstractDef}`,
          inline: true,
        });
      }
      if (docs.static) {
        description[0] = `🇸 ${inspect(description[0])}`;
        embed.addFields({
          name: '🇸tatic',
          value: `This property is static.\n>>> ${staticDef}`,
          inline: true,
        });
      }
      if (docs.private) {
        description[0] = `🇵 ${inspect(description[0])}`;
        embed.addFields({
          name: '🇵rivate',
          value: `This property is private.\n>>> ${privateDef}`,
          inline: true,
        });
      }
      if (docs.readonly)
        embed.addFields({
          name: 'Readonly',
          value: `This property is readonly.\n>>> ${readonlyDef}`,
          inline: true,
        });
    }

    await interaction.reply({
      embeds: [embed.setDescription(this.resolveType(description.join('\n')))],
    });
  }

  private resolveType(base: string): string {
    const resolved: string[] = [];

    for (const splited of base.split('\n')) {
      for (const str of splited.split(' ')) {
        let search = str;

        const isBold = /\*\*.+\*\*/.test(search);
        search = search.replaceAll('**', '');
        const isUnderline = /__.+__/.test(search);
        search = search.replaceAll('__', '');
        const isItalic = /\*.+\*/.test(search);
        search = search.replaceAll('*', '');

        if (this.docs.has(search)) {
          let result = `[${search}](${this.docs.get(search)?.url ?? ''})`;
          if (isBold) result = `**${result}**`;
          if (isUnderline) result = `__${result}__`;
          if (isItalic) result = `*${result}*`;

          resolved.push(result);
        } else {
          resolved.push(str);
        }
      }
      resolved.push('\n');
    }

    let result = resolved.join(' ');

    const seeLinkWithTitleRegex =
      /{@link (?<url>https?:\/\/[-_.!~*'()a-zA-Z0-9;/?:@&=+$,%#]+) (?<title>.+)}/;
    const seeLinkWithTitle = seeLinkWithTitleRegex.exec(result)?.groups ?? {};
    if (seeLinkWithTitle['url'])
      result = result.replace(
        seeLinkWithTitleRegex,
        `[${seeLinkWithTitle['title'] ?? ''}](${seeLinkWithTitle['url']})`
      );

    const seeLinkRegex =
      /{@link (?<url>https?:\/\/[-_.!~*'()a-zA-Z0-9;/?:@&=+$,%#]+)}/;
    const seeLink = seeLinkRegex.exec(result)?.groups ?? {};
    if (seeLink['url']) result = result.replace(seeLinkRegex, seeLink['url']);

    const seeOtherRegex = /{@link (?<docs>.+)}/;
    const seeOther = seeOtherRegex.exec(result)?.groups ?? {};
    if (seeOther['docs']) {
      const seeDocs = this.docs.get(
        seeOther['docs'].replaceAll('.', '#').replace('event:', '')
      )?.url;
      result = result.replace(
        seeOtherRegex,
        seeDocs
          ? `[${seeOther['docs'].replace('event:', '')}](${seeDocs})`
          : seeOther['docs']
      );
    }

    return result
      .replaceAll('<warn>', '⚠️ ')
      .replaceAll('</warn>', '')
      .replaceAll('<info>', '📖 ')
      .replaceAll('</info>', '')
      .replaceAll('Array | < | ', 'Array\\<')
      .replaceAll('Object | < | ', 'Object\\<')
      .replaceAll('Set | < | ', 'Set\\<')
      .replaceAll(' | ,  |', ',')
      .replaceAll(' | ,', ',')
      .replaceAll('( | ', '(')
      .replaceAll(' | |', '')
      .replaceAll(' | )', ')')
      .replaceAll(' | ()', '()')
      .replaceAll(' | >', '\\>');
  }

  public async autoCompletion(
    interaction: AutocompleteInteraction
  ): Promise<void> {
    if (!this.fuse) return;

    const input = `${interaction.options.getFocused()}`.replaceAll('.', '#');
    const search = this.fuse.search(input, { limit: 25 });

    await interaction.respond(
      search.map(({ item }) => ({ name: item, value: item }))
    );
  }
}
