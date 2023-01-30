import { compile } from 'coffeescript';
import { BaseBuildingSystem } from './base';

export class CoffeeScriptBuildingSystem extends BaseBuildingSystem {
  protected buildSnipet(content: string): Promise<string> {
    const result = compile(content);
    return Promise.resolve(result);
  }
}
