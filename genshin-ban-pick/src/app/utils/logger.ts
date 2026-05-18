// src/app/utils/logger.ts

export function createLogger(scope: string) {
    const prefix = `[${scope}]`;
    return {
        debug: console.debug.bind(console, prefix),
        info: console.info.bind(console, prefix),
        warn: console.warn.bind(console, prefix),
        error: console.error.bind(console, prefix),
    };
}
