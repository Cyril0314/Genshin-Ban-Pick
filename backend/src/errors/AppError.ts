// backend/src/errors/AppError.ts

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
export class UserExistsError extends AppError {
    constructor(cause?: Error) {
        super('USER_EXISTS', cause);
    }
}

export class UserNotFoundError extends AppError {
    constructor(cause?: Error) {
        super('USER_NOT_FOUND', cause);
    }
}

export class InvalidPasswordError extends AppError {
    constructor(cause?: Error) {
        super('INVALID_PASSWORD', cause);
    }
}

export class InvalidTokenError extends AppError {
    constructor(cause?: Error) {
        super('INVALID_TOKEN', cause);
    }
}

export class ExpiredTokenError extends AppError {
    constructor(cause?: Error) {
        super('EXPIRED_TOKEN', cause);
    }
}

export class MissingFieldsError extends AppError {
    constructor(cause?: Error) {
        super('MISSING_FIELDS', cause);
    }
}

export class DataNotFoundError extends AppError {
    constructor(cause?: Error) {
        super('DATA_NOT_FOUND', cause);
    }
}

export class InvalidRoomSettingError extends AppError {
    constructor(cause?: Error) {
        super('INVALID_ROOM_SETTING', cause);
    }
}

export class InvalidFieldsError extends AppError {
    constructor(cause?: Error) {
        super('INVALID_FIELDS', cause);
    }
}

export class DryRunError extends AppError {
    constructor(cause?: Error) {
        super('DRY_RUN', cause);
    }
}

export class DbUniqueConstraintError extends AppError {
    constructor(cause?: Error) {
        super("DB_UNIQUE_CONSTRAINT", cause);
    }
}

export class DbForeignKeyConstraintError extends AppError {
    constructor(cause?: Error) {
        super("DB_FOREIGN_KEY_CONSTRAINT", cause);
    }
}

export class DbConnectionError extends AppError {
    constructor(cause?: Error) {
        super("DB_CONNECTION_ERROR", cause);
    }
}

export const ErrorMeta = {
    USER_EXISTS: { status: 409, message: '帳號已存在' },
    USER_NOT_FOUND: { status: 404, message: '帳號不存在' },
    INVALID_PASSWORD: { status: 401, message: '密碼錯誤' },
    INVALID_TOKEN: { status: 401, message: '缺少或格式錯誤的 Authorization' },
    EXPIRED_TOKEN: { status: 401, message: 'Token 已過期' },
    MISSING_FIELDS: { status: 400, message: '請填寫欄位' },
    DATA_NOT_FOUND: { status: 404, message: '查無資料' },
    INVALID_ROOM_SETTING: { status: 500, message: '錯誤的房間設定' },
    INVALID_FIELDS: { status: 400, message: '錯誤的欄位設定' },
    DRY_RUN: { status: 500, message: '試運行錯誤' },
    DB_UNIQUE_CONSTRAINT: { status: 409, message: '資料已存在' },
    DB_FOREIGN_KEY_CONSTRAINT: { status: 400, message: '關聯資料存在，無法刪除' },
    DB_CONNECTION_ERROR: { status: 500, message: '資料庫連線錯誤' },
} as const;

export type ErrorCode = keyof typeof ErrorMeta;
