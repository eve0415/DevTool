import { spawn } from 'child_process';
import type { BaseMessageOptions, ColorResolvable } from 'discord.js';
import { Colors } from 'discord.js';
import { createMessageFromText } from '../util';
import { inspect } from 'util';

export abstract class BaseEvaluationSystem {
  protected embedColor: ColorResolvable = Colors.Blurple;
  protected result: unknown[] = [];
  private wasTooLong = false;

  protected evaluate(
    content: string,
    command: string,
    args: readonly string[] = []
  ): Promise<BaseMessageOptions> {
    return new Promise(res => {
      const child = spawn(command, args, { env: { TZ: process.env.TZ } });
      child.stdout.setEncoding('utf8');
      child.stderr.setEncoding('utf8');
      child.stdout.on('data', data => {
        this.result.push(data);
      });
      child.stderr.on('data', data => {
        this.embedColor = Colors.Red;
        this.result.push(data);
      });
      child.on('error', err => {
        if (this.wasTooLong) {
          this.embedColor = Colors.DarkRed;
          this.result.push('10秒を超過して実行することはできません');
        }
        res(this.createErrorMessage(err));
      });
      child.on('close', () => {
        if (this.wasTooLong) {
          this.embedColor = Colors.DarkRed;
          this.result.push('10秒を超過して実行することはできません');
        }
        res(this.createMessage(this.result));
      });
      child.stdin.end(content);

      setTimeout(() => {
        this.wasTooLong = true;
      }, 10000);
    });
  }

  protected processContent(content: unknown[]): string[] {
    const str = content.map(c =>
      typeof c !== 'string'
        ? inspect(c, { depth: null, maxArrayLength: null })
        : c
    );

    str.shift();

    return str
      .flatMap(s => s.split('\\n'))
      .map(s => s.trimEnd())
      .map(c =>
        c
          .replaceAll(
            /[\u001b\u009b][[()#;?]*(?:[0-9]{1,4}(?:;[0-9]{0,4})*)?[0-9A-ORZcf-nqry=><]/g,
            ''
          )
          .replaceAll('undefined\n>', '')
          .replaceAll('jshell>', '')
          .replaceAll('>', '')
      );
  }

  protected createMessage(contents: unknown[]): BaseMessageOptions {
    let result = this.processContent(contents)
      .filter(c => c)
      .join('\n');
    if (!result) result = '返り値がありません';

    return createMessageFromText(result, {
      title: "実行結果",
      embedColor: this.embedColor,
    });
  }

  protected createErrorMessage(error: Error): BaseMessageOptions {
    return {
      embeds: [
        {
          color: Colors.DarkRed,
          title: error.name,
          description: `${error.message}\n${error.stack ?? ''}`,
        },
      ],
    };
  }
}
