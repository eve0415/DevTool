import sass from 'sass';
import { BaseBuildingSystem } from './base';

export class SassBuildingSystem extends BaseBuildingSystem {
  constructor() {
    super({
      resultLanguage: 'css',
    });
  }

  protected async buildSnippet(content: string): Promise<string> {
    const { css } = await sass.compileStringAsync(content);
    return css;
  }
}
