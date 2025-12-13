export enum RoomEvent {
    UserJoinRequest = 'room.user.join.request',
    UserJoinBroadcast = 'room.user.join.broadcast',
    UserJoinResponse = 'room.user.join.response',

    UserLeaveRequest = 'room.user.leave.request',
    UserLeaveBroadcast = 'room.user.leave.broadcast',

    UsersStateSyncAll = 'room.users.state.sync.all',
}