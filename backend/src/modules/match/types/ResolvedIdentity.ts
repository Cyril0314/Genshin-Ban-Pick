// backend/src/modules/match/types/ResolvedIdentity.ts

export type ResolvedIdentity =
    | {
          kind: 'Manual';
          name: string;
          memberRef: undefined;
          guestRef: undefined;
      }
    | {
          kind: 'Member';
          name: string;
          memberRef: number;
          guestRef: undefined;
      }
    | {
          kind: 'Guest';
          name: string;
          memberRef: undefined;
          guestRef: number;
      };
