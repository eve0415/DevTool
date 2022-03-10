import log4js from 'log4js';

log4js.configure({
    appenders: {
        console: {
            type: 'stdout',
            layout: {
                type: 'pattern',
                pattern: '%[[%d]%] %[[%p]%] %[[%c]%]: %m',
            },
        },
    },
    categories: {
        default: { appenders: ['console'], level: 'info', enableCallStack: true },
    },
});
