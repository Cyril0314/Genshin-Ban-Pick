
export async function fetchRoomSetting() {
    const response = await fetch('/api/room-setting');
    const roomSetting = await response.json();
    return roomSetting;
}