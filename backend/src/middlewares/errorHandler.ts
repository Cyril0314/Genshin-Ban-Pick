// src/middlewares/errorHandler.ts

import { AppError } from '../errors/AppError.ts';
import { createLogger } from '../utils/logger.ts';

import type {  ErrorRequestHandler } from 'express';

const logger = createLogger('APP ERROR');

export const errorHandler: ErrorRequestHandler = (err, req, res, next) => {
    if (err instanceof AppError) {
        logger.error('Error is instance of AppError', {
            code: err.code,
            message: err.message,
            status: err.statusCode,
            cause: err.cause?.message,
            causeStack: err.cause?.stack,
            stack: err.stack,
        });

        res.status(err.statusCode).json({
            code: err.code,
            message: err.message,
        });
        return
    }

    logger.error(`Unknown error`, {
        name: err.name,
        message: err.message,
        stack: err.stack,
    });

     res.status(500).json({
        code: "INTERNAL_ERROR",
        message: "伺服器錯誤",
    });
};