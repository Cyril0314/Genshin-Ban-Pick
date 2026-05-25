// backend/src/middlewares/accessLog.ts

import { createLogger } from '../utils/logger';

import type { RequestHandler } from 'express';

const logger = createLogger('http.access');

export function createAccessLog(): RequestHandler {
    return (req, res, next) => {
        const start = Date.now();
        res.on('finish', () => {
            const duration = Date.now() - start;
            logger.info(`${req.method} ${req.originalUrl} ${res.statusCode} ${duration}ms`);
        });
        next();
    };
}
