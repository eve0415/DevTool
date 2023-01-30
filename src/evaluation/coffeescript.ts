import type { BaseMessageOptions } from 'discord.js';
import { compile } from 'coffeescript';
import { BaseEvaluationSystem } from './base';
import { JavaScriptEvaluationSystem } from './javascript';

export class CoffeeScriptEvaluationSystem extends BaseEvaluationSystem {
  public override evaluate(content: string): Promise<BaseMessageOptions> {
    return new Promise(res => {
      const script = compile(content);
      res(new JavaScriptEvaluationSystem().evaluate(script));
    });
  }
}
