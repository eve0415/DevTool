import type { BaseMessageOptions } from 'discord.js';
import { BaseEvaluationSystem } from './base';

export class CSharpEvaluationSystem extends BaseEvaluationSystem {
  public override evaluate(content: string): Promise<BaseMessageOptions> {
    return super.evaluate(`${content}\nEnvironment.Exit(0);\n`, 'csi');
  }

  protected override createMessage(contents: unknown[]): BaseMessageOptions {
    return super.createMessage(contents.slice(3));
  }
}
