import sass from "sass";
import { BaseBuildingSystem } from "./base";

export class SassBuildingSystem extends BaseBuildingSystem {
  protected async buildSnipet(content: string): Promise<string> {
    const { css } = await sass.compileStringAsync(content);
    return css;
  }
}
