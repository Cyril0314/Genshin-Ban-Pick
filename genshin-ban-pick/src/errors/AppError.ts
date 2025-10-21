// src/errors/AppError.ts

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
        super(ErrorCode.SOCKET_NOT_CONNECTED, 1000, '');
    }
}

export enum ErrorCode {
    SOCKET_NOT_CONNECTED = 'SOCKET_NOT_CONNECTED',
    // USER_NOT_FOUND = 'USER_NOT_FOUND',
    // DATA_NOT_FOUND = 'DATA_NOT_FOUND',
    // INVALID_PASSWORD = 'INVALID_PASSWORD',
    // INVALID_TOKEN = 'INVALID_TOKEN',
    // EXPIRED_TOKEN = 'EXPIRED_TOKEN',
    // MISSING_FIELDS = 'MISSING_FIELDS',
    // DB_CONNECTION_ERROR = 'DB_CONNECTION_ERROR',
}
