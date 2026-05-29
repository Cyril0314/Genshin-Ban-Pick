import type { Principal } from '@shared/contracts/auth/Principal';

declare global {
    namespace Express {
        interface Request {
            user?: Principal;
        }
    }
}
