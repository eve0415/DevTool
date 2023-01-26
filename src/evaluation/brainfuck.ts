import type { BaseMessageOptions } from 'discord.js';
import { Brainfuck } from '../Brainfuck';
import { BaseEvaluationSystem } from './base';

export class BrainfuckEvaluationSystem extends BaseEvaluationSystem {
  public override evaluate(content: string): Promise<BaseMessageOptions> {
    return new Promise(res => {
      if (content.includes(',')) {
        res(this.createErrorMessage(new TypeError('`,`は使用できません。')));
        return;
      }

      try {
        res(
          this.createMessage([
            '',
            ...new Brainfuck(content).execute().split(' '),
          ])
        );
      } catch (e) {
        res(this.createErrorMessage(e as TypeError));
      }
    });
  }
}
