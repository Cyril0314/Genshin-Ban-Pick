export enum TeamEvent {
    MemberJoinRequest = 'team.member.add.request',
    MemberJoinBroadcast = 'team.member.add.broadcast',
    MemberLeaveRequest = 'team.member.remove.request',
    MemberLeaveBroadcast = 'team.member.remove.broadcast',

    MembersMapStateRequest = 'team.members_map.state.reqeust',
    MembersMapStateSyncSelf = 'team.members_map.state.sync.self',
    MembersMapStateSyncAll = 'team.members_map.state.sync.all',
}