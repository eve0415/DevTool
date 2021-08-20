import { DevToolBot } from './DevToolBot';

export const instance = new DevToolBot();

instance.start().catch(e => console.error(e));

['SIGTERM', 'SIGINT'].forEach(signal => process.on(signal, () => instance.shutdown()));
