export enum LineupEvent {
    ImagePlaceRequest = 'lineup.image.place.request',
    ImagePlaceBroadcast = 'lineup.image.place.broadcast',

    ImageRemoveRequest = 'lineup.image.remove.request',
    ImageRemoveBroadcast = 'lineup.image.remove.broadcast',

    ImageMapResetRequest = 'lineup.image_map.reset.request',
    ImageMapResetBroadcast = 'lineup.image_map.reset.broadcast',

    ImageMapStateRequest = 'lineup.image_map.state.request',
    ImageMapStateSyncSelf = 'lineup.image_map.state.sync.self',

    AllTeamImageMapResetRequest = 'lineup.all_team.image_map.reset.request',
    AllTeamImageMapResetBroadcast = 'lineup.all_team.image_map.reset.broadcast',
}
