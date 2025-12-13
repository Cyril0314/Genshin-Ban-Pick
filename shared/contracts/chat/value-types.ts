
export enum ChatEvent {
    MessageSendRequest = 'chat.message.send.request',
    MessageSendBroadcast = 'chat.message.send.broadcast',

    MessagesStateRequest = 'chat.messages.state.request',
    MessagesStateSyncSelf = 'chat.messages.state.sync.self',
}
