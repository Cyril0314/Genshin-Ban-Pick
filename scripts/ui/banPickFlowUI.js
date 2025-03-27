// banPickFlowUI.js (前端 UI 用)

export function showCurrentStepText(step) {
    const textBox = document.getElementById('step-indicator');
    if (!textBox) return;

    if (!step) {
        textBox.textContent = '選角結束';
    } else {
        textBox.textContent = `現在輪到 ${step.player} 選擇 ${step.zoneId}`;
    }
}

export function highlightZones(step) {
    const allZones = document.querySelectorAll('.drop-zone');
    allZones.forEach(zone => zone.classList.remove('highlight'));

    // if (!step || step.player !== myPlayerId) return;

    allZones.forEach(zone => {
        const zoneId = zone.dataset.zoneId;
        console.log(`zoneId: ${zoneId} step.zoneId: ${step.zoneId}`)
        if (zoneId === `zone-${step.zoneId}`) {
            zone.classList.add('highlight');
        }
    });
}