// src/app/errors/AppError.ts

export class AppError extends Error {
    code: ErrorCode;
    statusCode: number;
    cause?: Error;

    constructor(code: ErrorCode, cause?: Error, overrideMessage?: string) {
        const meta = ErrorMeta[code];
        super(overrideMessage ?? meta.message);
        this.code = code;
        this.statusCode = meta.status;

        if (cause && cause.stack) {
            this.stack += `\nCaused by: ${cause.stack}`;
        }
    }
}

export class SocketNotConnected extends AppError {
    constructor(cause?: Error) {
        super('SOCKET_NOT_CONNECTED', cause);
    }
}

export class TokenNotFound extends AppError {
    constructor(cause?: Error) {
        super('TOKEN_NOT_FOUND', cause);
    }
}

export class DependencyNotProvided extends AppError {
    constructor(key: any) {
        const overrideMessage = `${String(key)} 依賴沒有注入`;
        super('DEPENDENCY_NOT_PROVIDED', undefined, overrideMessage);
    }
}

export const ErrorMeta = {
    SOCKET_NOT_CONNECTED: { status: 1000, message: 'Socket 尚未連線' },
    TOKEN_NOT_FOUND: { status: 2000, message: '沒有用戶金鑰' },
    DEPENDENCY_NOT_PROVIDED: { status: 3000, message: '依賴沒有注入' },
    // USER_NOT_FOUND = 'USER_NOT_FOUND',
    // DATA_NOT_FOUND = 'DATA_NOT_FOUND',
    // INVALID_PASSword = 'INVALID_PASSword',
    // INVALID_TOKEN = 'INVALID_TOKEN',
    // EXPIRED_TOKEN = 'EXPIRED_TOKEN',
    // MISSING_FIELDS = 'MISSING_FIELDS',
    // DB_CONNECTION_ERROR = 'DB_CONNECTION_ERROR',
} as const;

export type ErrorCode = keyof typeof ErrorMeta;
