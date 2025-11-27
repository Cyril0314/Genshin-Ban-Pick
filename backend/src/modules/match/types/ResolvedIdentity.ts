// backend/src/modules/match/types/ResolvedIdentity.ts

export type ResolvedIdentity =
    | {
          kind: 'Manual';
          name: string;
          memberRef: null;
          guestRef: null;
      }
    | {
          kind: 'Member';
          name: string;
          memberRef: number;
          guestRef: null;
      }
    | {
          kind: 'Guest';
          name: string;
          memberRef: null;
          guestRef: number;
      };
