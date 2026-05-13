export interface FeatureBlock {
    name: string;
    prefix: string;        // 用 colKey prefix 分類 block
    size?: number;         // 由實際 colKey 自動計算，也可手動指定
}

export const FEATURE_BLOCKS: FeatureBlock[] = [
    { name: 'synergy', prefix: 'synergy:' },
    { name: 'element', prefix: 'element:' },
    // { name: 'weapon', prefix: 'weapon:' },
    // { name: 'region', prefix: 'region:' },
    { name: 'role', prefix: 'role:' },
];