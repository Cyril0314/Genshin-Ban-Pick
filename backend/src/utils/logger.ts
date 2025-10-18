// src/utils/logger.ts

type LogLevel = 'debug' | 'info' | 'warn' | 'error';

const LOG_LEVELS: Record<LogLevel, number> = {
    debug: 0, // 詳細資訊，開發階段觀察內部狀態，需打開瀏覽器 verbose
    info: 1, // 一般流程或里程碑
    warn: 2, // 可運行但不預期的情況
    error: 3, // 錯誤與例外
};

// 環境等級控制（可用環境變數調整）
const CURRENT_LEVEL = process.env.VITE_LOG_LEVEL || 'debug';

function shouldLog(level: LogLevel) {
    return LOG_LEVELS[level] >= LOG_LEVELS[CURRENT_LEVEL as LogLevel];
}

function getCallerScope(): string {
    const stack = new Error().stack?.split('\n') ?? [];
    const line = stack[3] || stack[2];
    const match = line.match(/\/src\/(.+?):\d+:\d+/);
    return match ? match[1].replace(/\//g, ':') : 'unknown';
}

export const logger = {
    debug: (...args: any[]) => {
        if (!shouldLog('debug')) return;
        const scope = getCallerScope();
        console.debug(`%c[DEBUG][${scope}]`, 'color:#93c5fd;font-weight:bold;', ...args);
    },
    info: (...args: any[]) => {
        if (!shouldLog('info')) return;
        const scope = getCallerScope();
        console.info(`%c[INFO][${scope}]`, 'color:#34d399;font-weight:bold;', ...args);
    },
    warn: (...args: any[]) => {
        if (!shouldLog('warn')) return;
        const scope = getCallerScope();
        console.warn(`%c[WARN][${scope}]`, 'color:#fbbf24;font-weight:bold;', ...args);
    },
    error: (...args: any[]) => {
        if (!shouldLog('error')) return;
        const scope = getCallerScope();
        console.error(`%c[ERROR][${scope}]`, 'color:#f87171;font-weight:bold;', ...args);
    },
};
