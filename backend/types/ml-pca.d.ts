declare module 'ml-pca' {
    export default class PCA {
        constructor(data: number[][]);
        predict(
            data: number[][],
            options?: { nComponents?: number },
        ): {
            to2DArray(): number[][];
        };
    }
}

declare module 'ml-pca' {
    export default class PCA {
        constructor(data: number[][]);
        predict(data: number[][], options?: { nComponents: number }): { to2DArray(): number[][] };
    }
}
