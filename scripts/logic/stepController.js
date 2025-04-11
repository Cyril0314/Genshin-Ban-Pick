// scripts/logic/stepController.js

export const stepController = {
    currentStep: null,
    set(step) { this.currentStep = step; },
    isCurrentZone(zoneId) {
        return this.currentStep?.zoneId === zoneId;
    },
    get() { return this.currentStep; }
};