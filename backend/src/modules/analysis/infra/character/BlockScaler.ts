import { FeatureMatrix } from "@shared/contracts/analysis/FeatureMatrix";
import { FeatureBlock} from "./featureBlocks";

export default class BlockScaler {
    constructor(private blocks: FeatureBlock[]) {}

    applyScaling<RowKey extends string, ColKey extends string>(
        fm: FeatureMatrix<RowKey, ColKey, number>,
    ): FeatureMatrix<RowKey, ColKey, number> {
        const { rowKeys, colKeys, data } = fm;

        // 深拷貝
        const scaled = data.map((row) => [...row]);

        for (const block of this.blocks) {
            const indices = this.findBlockIndices(colKeys, block.prefix);

            if (indices.length === 0) {
                console.warn(`[BlockScaler] Block "${block.name}" has no columns.`);
                continue;
            }

            const scale = Math.sqrt(indices.length);

            for (const r of scaled) {
                for (const col of indices) {
                    r[col] = r[col] / scale;
                }
            }
        }

        return { rowKeys, colKeys, data: scaled };
    }

    private findBlockIndices(colKeys: string[], prefix: string): number[] {
        const list: number[] = [];
        colKeys.forEach((k, idx) => {
            if (k.startsWith(prefix)) list.push(idx);
        });
        return list;
    }
}
