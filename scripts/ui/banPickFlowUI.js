// scripts/ui/banPickFlowUI.js

export function showCurrentStepText(step) {
    const textBox = document.getElementById('step-indicator');
    textBox.classList.add('active');
    setTimeout(() => textBox.classList.remove('active'), 1200);

    if (!textBox) return;

    if (!step) {
        textBox.textContent = '選角結束';
    } else {
        // textBox.textContent = '選角結束';
        textBox.textContent = `現在輪到 ${step.player}\n選擇 ${step.zoneId} 角色`;
    }
}

export function highlightZones(step) {
    const allZones = document.querySelectorAll('.grid-item__drop-zone');
    allZones.forEach(zone => zone.classList.remove('highlight'));
    allZones.forEach(zone => {
        const zoneId = zone.id;
        // console.log(`zoneId: ${zoneId} step.zoneId: ${step.zoneId}`)
        if (zoneId === step.zoneId) {
            zone.classList.add('highlight');
        }
    });
}