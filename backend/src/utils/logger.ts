// src/utils/logger.ts

type LogLevel = 'debug' | 'info' | 'warn' | 'error';

const LOG_LEVELS: Record<LogLevel, number> = {
    debug: 0, // 詳細資訊，開發階段觀察內部狀態，需打開瀏覽器 verbose
    info: 1, // 一般流程或里程碑
    warn: 2, // 可運行但不預期的情況
    error: 3, // 錯誤與例外
};

// 環境等級控制（可用環境變數調整）
const CURRENT_LEVEL = process.env.LOG_LEVEL || 'debug';

function shouldLog(level: LogLevel) {
    return LOG_LEVELS[level] >= LOG_LEVELS[CURRENT_LEVEL as LogLevel];
}

interface LogEntry {
    timestamp: string;
    level: LogLevel;
    scope: string;
    message: string;
    context?: Record<string, any>;
}

export function createLogger(scope: string) {
    const colors = {
        reset: '\x1b[0m',
        debug: '\x1b[34m', // Blue
        info: '\x1b[32m',  // Green
        warn: '\x1b[33m',  // Yellow
        error: '\x1b[31m', // Red
        bold: '\x1b[1m',
    };

    return {
        debug: (...args: any[]) => {
            if (!shouldLog('debug')) return;
            console.debug(`${colors.debug}${colors.bold}[DEBUG][${scope}]${colors.reset}`, ...args);
        },
        info: (...args: any[]) => {
            if (!shouldLog('info')) return;
            console.info(`${colors.info}${colors.bold}[INFO][${scope}]${colors.reset}`, ...args);
        },
        warn: (...args: any[]) => {
            if (!shouldLog('warn')) return;
            console.warn(`${colors.warn}${colors.bold}[WARN][${scope}]${colors.reset}`, ...args);
        },
        error: (...args: any[]) => {
            if (!shouldLog('error')) return;
            console.error(`${colors.error}${colors.bold}[ERROR][${scope}]${colors.reset}`, ...args);
        },
    };
}

