export enum TacticalEvent {
    CellImagePlaceRequest = 'tactical.cell.image.place.request',
    CellImagePlaceBroadcast = 'tactical.cell.image.place.broadcast',

    CellImageRemoveRequest = 'tactical.cell.image.remove.request',
    CellImageRemoveBroadcast = 'tactical.cell.image.remove.broadcast',

    CellImageMapResetRequest = 'tactical.cell.image_map.reset.request',
    CellImageMapResetBroadcast = 'tactical.cell.image_map.reset.broadcast',

    CellImageMapStateRequest = 'tactical.cell.image_map.state.request',
    CellImageMapStateSyncSelf = 'tactical.cell.image_map.state.sync.self',
}