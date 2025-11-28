// backend/src/modules/socket/domain/IAuthValidator.ts

export interface IAuthValidator {
    verifySession(token: string): Promise<{ id: number, nickname: string, type: 'Member' | 'Guest' }>;
}
