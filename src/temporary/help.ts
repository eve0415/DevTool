import type { InteractionReplyOptions, ReplyMessageOptions } from 'discord.js';

export function getHelp(replyTo: 'interaction'): InteractionReplyOptions;
export function getHelp(replyTo: 'message'): ReplyMessageOptions;
export function getHelp(): InteractionReplyOptions | ReplyMessageOptions {
    const options: InteractionReplyOptions | ReplyMessageOptions = {
        embeds: [{
            title: 'ヘルプ？',
            description: [
                'どうも',
                '使い方説明ですよ',
                '',
                '前回の使い方とはかなり変わりました(Discord の変化に追従するため)',
                'コードを伴わないコマンドはスラッシュコマンドに移行しました',
                'コードを実行したり、整形するコマンドは該当するメッセージに対して右クリックをして、アプリ>`コマンド`を選択してください',
                '注意点としては、コードブロックが必須になりました。コードブロックを使用したメッセージに対して実行してください',
                '様々な対策していますのでよっぽどの限り BOT が落ちることがありませんが、応答しなくなったりクラッシュした場合は自動的に再起動されます',
                'だからといって他人に迷惑がかかるようなコードを実行しないようにしましょう',
                'システム側の負荷は微々たるものなので負荷はかけてもらっても大丈夫です',
                'もしトークンなどの機密情報が漏れてしまうコードを見つけてしまった場合はすぐに連絡をください',
                '',
                '',
                '携帯だとメッセージに対してインタラクションを実行することができないようなので、該当するメッセージに対して `lint`・`run` をリプライしてください',
                'これは一時的な処置です',
                '',
                '',
                '',
                '最後に、対応していない言語が多いので対応できるようにしませんか？',
                'ぜひあなたの頭と力を貸してください',
                'PRお待ちしております。',
            ].join('\n'),
            color: 'BLURPLE',
        }],
        components: [{
            type: 'ACTION_ROW',
            components: [{
                type: 'BUTTON',
                style: 'LINK',
                label: 'GitHub',
                url: 'https://github.com/eve0415/DevTool',
            }],
        }],
    };

    return options;
}
