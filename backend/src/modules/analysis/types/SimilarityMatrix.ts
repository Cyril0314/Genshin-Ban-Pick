// src/modules/analysis/types/SimilarityMatrix.ts

/**
 * 相似度矩陣：定義 A 與 B 的「關係強度」
 * Graph edge weight（社群偵測、中心性分析）
 */
type SimilarityMatrix = Record<string, Record<string, number>>;