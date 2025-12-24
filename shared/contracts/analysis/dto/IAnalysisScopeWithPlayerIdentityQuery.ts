export interface IAnalysisScopeWithPlayerIdentityQuery {
    scope: 'global' | 'player'
    type?: 'member' | 'guest' | 'name'
    id?: number
    name?: string
}