// src/utils/logger.ts

type LogLevel = 'debug' | 'info' | 'warn' | 'error';

const LOG_LEVELS: Record<LogLevel, number> = {
    debug: 0, // 詳細資訊，開發階段觀察內部狀態，需打開瀏覽器 verbose
    info: 1, // 一般流程或里程碑
    warn: 2, // 可運行但不預期的情況
    error: 3, // 錯誤與例外
};

// 環境等級控制（可用環境變數調整）
const CURRENT_LEVEL = import.meta.env.VITE_LOG_LEVEL || 'debug';
const isDev = import.meta.env.DEV;

function shouldLog(level: LogLevel) {
    return LOG_LEVELS[level] >= LOG_LEVELS[CURRENT_LEVEL as LogLevel];
}

/** 為避免包裹造成行號錯誤，綁定原始 console 方法 */
const cInfo = console.info.bind(console);
const cDebug = console.debug.bind(console);
const cWarn = console.warn.bind(console);
const cError = console.error.bind(console);

/** 顏色樣式設定 */
const colorStyles: Record<LogLevel, string> = {
  debug: 'color:#93c5fd;font-weight:bold;',
  info: 'color:#34d399;font-weight:bold;',
  warn: 'color:#fbbf24;font-weight:bold;',
  error: 'color:#f87171;font-weight:bold;',
};

/** 時間字串（不含日期） */
function now() {
  return new Date().toISOString().split('T')[1].split('.')[0];
}

/**
 * 單行輸出核心函式
 * 這裡直接呼叫被 bind 的 console 方法（不破壞 call stack）
 */
function baseLog(level: LogLevel, ...args: any[]) {
  if (!shouldLog(level)) return;
  if (!isDev && level === 'debug') return;

  const prefix = `%c[${now()}][${level.toUpperCase()}]`;
  const style = colorStyles[level];

  switch (level) {
    case 'debug':
      cDebug(prefix, style, ...args);
      break;
    case 'info':
      cInfo(prefix, style, ...args);
      break;
    case 'warn':
      cWarn(prefix, style, ...args);
      break;
    case 'error':
      cError(prefix, style, ...args);
      break;
  }
}

/**
 * 主 logger 介面
 * 用法範例：
 *   log.info('BanPickBoard mounted')
 *   log.warn('TeamInfo sync mismatch', data)
 */
export const log = {
  debug: (...args: any[]) => baseLog('debug', ...args),
  info: (...args: any[]) => baseLog('info', ...args),
  warn: (...args: any[]) => baseLog('warn', ...args),
  error: (...args: any[]) => baseLog('error', ...args),
};
