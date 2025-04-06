// stepController.js

export const stepController = {
    currentStep: null,
    set(step) { this.currentStep = step; },
    isCurrentZone(zoneId) {
        // console.log(`${zoneId}`);
        // console.log(`${`zone-${this.currentStep?.zoneId}`}`);
        return `zone-${this.currentStep?.zoneId}` === zoneId;
    },
    get() { return this.currentStep; }
};