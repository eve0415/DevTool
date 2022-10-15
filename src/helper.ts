import type { BaseMessageOptions, InteractionReplyOptions } from 'discord.js';
import { ButtonStyle, Colors, ComponentType } from 'discord.js';

export function parseContent(content: string): string[] {
    const parse = content.split(/(?:`{3}(`{3})`{3}|(`{3}))/g).filter(s => s);
    const sort: string[] = [];
    for (const p of parse) {
        sort.push(sort[sort.length - 1]?.lastIndexOf('```') === 0 ? `${sort.pop()}${p}` : p);
    }
    const purge = sort.filter(s => s.startsWith('```'));
    return purge;
}

export function getHelp(replyTo: 'interaction'): InteractionReplyOptions;
export function getHelp(replyTo: 'message'): BaseMessageOptions;
export function getHelp(): InteractionReplyOptions | BaseMessageOptions {
    const options: InteractionReplyOptions | BaseMessageOptions = {
        embeds: [{
            title: 'ヘルプ？',
            description: [
                'どうも',
                '使い方説明ですよ',
                '',
                'コードを伴わないコマンドはスラッシュコマンドに移行しました',
                'コードを実行したり、整形するコマンドは該当するメッセージに対して右クリックをして、アプリ>`コマンド`を選択してください',
                'コードを実行または整形する場合は、コードブロックが必須になりました。コードブロックを使用したメッセージに対して実行してください',
                '様々な対策していますのでよっぽどの限り BOT が落ちることがありませんが、応答しなくなったりクラッシュした場合は自動的に再起動されます',
                'だからといって他人に迷惑がかかるようなコードを実行しないようにしましょう',
                'システム側の負荷は微々たるものなので負荷はかけてもらっても大丈夫です',
                'もしトークンなどの機密情報が漏れてしまうコードを見つけてしまった場合はすぐに連絡をください',
                '',
                '',
                '携帯でもインタラクションが使えます。調べてください。',
                '一時的な処置である `run` `lint` コマンドは撲滅しました。',
                '',
                '',
                '',
                '最後に、対応していない言語が多いので対応できるようにしませんか？',
                'ぜひあなたの頭と力を貸してください',
                'PRお待ちしております。',
            ].join('\n'),
            color: Colors.Blurple,
        }],
        components: [{
            type: ComponentType.ActionRow,
            components: [{
                type: ComponentType.Button,
                style: ButtonStyle.Link,
                label: 'GitHub',
                url: 'https://github.com/eve0415/DevTool',
            }],
        }],
    };

    return options;
}
