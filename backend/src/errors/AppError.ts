// backend/src/errors/AppError.ts

export class AppError extends Error {
    code: ErrorCode;
    statusCode: number;

    constructor(code: ErrorCode, statusCode: number, message: string) {
        super(message);
        this.code = code;
        this.statusCode = statusCode;
    }
}

export class UserExistsError extends AppError {
    constructor() {
        super(ErrorCode.USER_EXISTS, 409, '帳號已存在');
    }
}

export class UserNotFoundError extends AppError {
    constructor() {
        super(ErrorCode.USER_NOT_FOUND, 404, '帳號不存在');
    }
}

export class InvalidPasswordError extends AppError {
    constructor() {
        super(ErrorCode.INVALID_PASSWORD, 401, '密碼錯誤');
    }
}

export class InvalidTokenError extends AppError {
    constructor() {
        super(ErrorCode.INVALID_TOKEN, 401, '缺少或格式錯誤的 Authorization');
    }
}

export class ExpiredTokenError extends AppError {
    constructor() {
        super(ErrorCode.EXPIRED_TOKEN, 401, 'Token 已過期');
    }
}

export class MissingFieldsError extends AppError {
    constructor() {
        super(ErrorCode.MISSING_FIELDS, 400, '請填寫欄位');
    }
}

export class DataNotFound extends AppError {
    constructor() {
        super(ErrorCode.DATA_NOT_FOUND, 404, '查無資料');
    }
}

export class InvalidRoomSetting extends AppError {
    constructor() {
        super(ErrorCode.INVALID_ROOM_SETTING, 500, '錯誤的房間設定');
    }
}

export enum ErrorCode {
    USER_EXISTS = 'USER_EXISTS',
    USER_NOT_FOUND = 'USER_NOT_FOUND',
    DATA_NOT_FOUND = 'DATA_NOT_FOUND',
    INVALID_PASSWORD = 'INVALID_PASSWORD',
    INVALID_TOKEN = 'INVALID_TOKEN',
    EXPIRED_TOKEN = 'EXPIRED_TOKEN',
    MISSING_FIELDS = 'MISSING_FIELDS',
    DB_CONNECTION_ERROR = 'DB_CONNECTION_ERROR',
    INVALID_ROOM_SETTING = 'INVALID_ROOM_SETTING',
}
