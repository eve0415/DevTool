import type { CompilerOptions } from 'typescript';
import ts from 'typescript';
import { BaseBuildingSystem } from './base';
import tsconfig from '../../tsconfig.json';

export class TypeScriptBuildingSystem extends BaseBuildingSystem {
  constructor() {
    super({
      resultLanguage: 'js',
    });
  }

  protected buildSnippet(content: string): Promise<string> {
    const { outputText } = ts.transpileModule(content, {
      ...tsconfig,
      compilerOptions: {
        ...(tsconfig.compilerOptions as unknown as CompilerOptions),
        noImplicitUseStrict: true,
        alwaysStrict: false,
        strict: false,
        jsx: ts.JsxEmit.Preserve,
      },
    });
    return Promise.resolve(outputText);
  }
}
