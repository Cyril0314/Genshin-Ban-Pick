export interface IPlayerStyleProfileQuery {
    type: 'member' | 'guest' | 'name'
    id?: number
    name?: string
}