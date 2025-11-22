// src/app/errors/AppError.ts

export class AppError extends Error {
  code: ErrorCode;
  statusCode: number;

  constructor(code: ErrorCode, statusCode: number, message: string) {
    super(message);
    this.code = code;
    this.statusCode = statusCode;
  }
}

export class SocketNotConnected extends AppError {
    constructor() {
        super(ErrorCode.SOCKET_NOT_CONNECTED, 1000, 'Socket 尚未連線');
    }
}

export class TokenNotFound extends AppError {
  constructor() {
        super(ErrorCode.TOKEN_NOT_FOUND, 2000, '沒有用戶金鑰');
    }
}

export enum ErrorCode {
    SOCKET_NOT_CONNECTED = 'SOCKET_NOT_CONNECTED',
    TOKEN_NOT_FOUND = 'TOKEN_NOT_FOUND'
    // USER_NOT_FOUND = 'USER_NOT_FOUND',
    // DATA_NOT_FOUND = 'DATA_NOT_FOUND',
    // INVALID_PASSword = 'INVALID_PASSword',
    // INVALID_TOKEN = 'INVALID_TOKEN',
    // EXPIRED_TOKEN = 'EXPIRED_TOKEN',
    // MISSING_FIELDS = 'MISSING_FIELDS',
    // DB_CONNECTION_ERROR = 'DB_CONNECTION_ERROR',
}
