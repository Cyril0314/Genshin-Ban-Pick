export interface ISynergyMatrix {
    [characterKey: string]: {
        [otherKey: string]: number;
    };
}
