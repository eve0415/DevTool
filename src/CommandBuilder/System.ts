import { BaseCommandBuilder } from './Base';

export class SystemCommandBuilder extends BaseCommandBuilder {
    public constructor() {
        super();
        // System
        this.madeBy = '0';
        this.madeIn = '0';
    }
}
