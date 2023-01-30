import { compile } from 'coffeescript';
import { BaseBuildingSystem } from './base';

export class CoffeeScriptBuildingSystem extends BaseBuildingSystem {
  protected buildSnippet(content: string): Promise<string> {
    const result = compile(content);
    return Promise.resolve(result);
  }
}
