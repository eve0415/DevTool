# DevTool

## 説明

Discord で簡単なプログラムを実行するためのボットです。  
各コードを１０秒以上実行することはできません。  
またプログラムの整形もできます。(Prettier)  
他にも、[discord.js](https://discord.js.org/#/docs/main/stable/general/welcome) のドキュメント検索機能も持っています。  
一言でいえば、開発者やボット、コードで遊びたい方向けのボットです。

## 導入

[リンク](https://discord.com/api/oauth2/authorize?client_id=832847499306991636&permissions=0&scope=bot%20applications.commands)

### 権限

上のリンクには権限を設定していませんが、実際には以下の権限が必要です。

- チャンネルを見る
- メッセージを送信
- スレッドでメッセージを送信[^1]
- メッセージ履歴を読む
- アプリコマンドを使う[^2]

[^1]: ユーザーがスレッドでコマンドを実行したりする場合。
[^2]: ボットではなく、ユーザーが必要な権限。

## 使い方

### コードを実行/整形/ビルド

1. コードブロックを使ってメッセージを送信してください。

    例）

    ```text
    ```js
    console.log('Hello World')
    ​```
    ```

2. 送信したメッセージを右クリックして、`アプリ > 実行` ボタンを押してください。

### djsドキュメント検索

スラッシュコマンドを採用しています。  
`/docs <query>`  
`query` には検索したい単語を入力してください。

## 対応している言語の表

言語 | 実行 | 整形 | ビルド
--- | :---: | :---: | :---:
JavaScript | ✓ | ✓ |
TypeScript | ✓ | ✓ | ✓
CoffeeScript | ✓ | ✓ | ✓
TSX | | | ✓
Deno | ✓ |
Python | ✓ |
Java | ✓ |
Kotlin | ✓ |
C# | ✓ |
Brainfuck | ✓ |
HTML | | ✓
CSS | | ✓
Sass/Scss | | | ✓
MarkDown | | ✓
JSON | | ✓
YAML | | ✓

## 諸注意

簡単にプログラムを実行できる分、環境変数なども出せます。  
機密情報などが漏れないように対策してます（つもり）が、トークンなどが漏れてしまった場合は早急に連絡ください。  
また、システムに多大なる負荷をかけることも実質可能です。  
すべて対策ができればいいのですが、私の技術不足のために叶いません。  
よっぽどのことではシステムダウンすることはないと思いますが、常識を考えて実行してください。  
本格的に遊ぶ場合は、@eve0415 がいるときにしましょう。

### 制限について

最悪な事態を考慮して、システムにも制限をかけています。  
ファイルシステム(FS)には読み取り専用(RO)にしてあります。  
ファイル書き出しなどはできませんのでご注意ください。  
このプロジェクトは `TypeScript` で書いており、実行環境は `Debian` です。  
知識がある人は様々な方法で抜け道を探そうと頑張る人もいます。  
もし、「こんなことできちゃったけど、大丈夫？」的な状況になったら教えてください。

## 貢献する方法

このプロジェクトに貢献してくれる人大歓迎です！！  
この言語に対応させたいとか細かい修正したい人とかはじゃんじゃんPRください。  
開発、デバッグは [VSCode](https://code.visualstudio.com/) がおすすめです。  
[Docker](https://www.docker.com/) も併用して、常に同じ環境になるようにするのが一番いいです。（Windows と Linux の互換性）

## 独り言

いろんな言語を対応させたいな～  
目指せすべての言語（無理）
