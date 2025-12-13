
export type KeyIndexedMatrix<RowKey extends string, ColKey extends string, Value = number> = {
    [R in RowKey]: Partial<Record<ColKey, Value>>;
};