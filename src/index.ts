import { DevToolBot } from './DevToolBot';

const instance = new DevToolBot();

instance.start().catch(e => console.error(e));

['SIGTERM', 'SIGINT'].forEach(signal => process.on(signal, () => {
    instance.shutdown();
}));
