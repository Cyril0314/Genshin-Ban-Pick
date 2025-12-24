export interface IPlayerIdentityQuery {
    type: 'member' | 'guest' | 'name'
    id?: number
    name?: string
}