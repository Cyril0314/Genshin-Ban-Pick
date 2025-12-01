export enum ZoneType {
    Ban = 'Ban',
    Pick = 'Pick',
    Utility = 'Utility',
}

export enum BoardEvent {
    ImageDropRequest = 'board.image.drop.request',
    ImageDropBroadcast = 'board.image.drop.broadcast',

    ImageRestoreRequest = 'board.image.restore.request',
    ImageRestoreBroadcast = 'board.image.restore.broadcast',

    ImageMapResetRequest = 'board.image_map.reset.request',
    ImageMapResetBroadcast = 'board.image_map.reset.broadcast',

    ImageMapStateRequest = 'board.image_map.state.request',
    ImageMapStateSyncSelf = 'board.image_map.state.sync.self',
}
