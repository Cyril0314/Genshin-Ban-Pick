
declare module "ml-kmeans" {
  export default function kmeans(
    data: number[][],
    k: number,
    options?: { initialization?: "random" | "kmeans++" }
  ): { clusters: number[]; centroids: number[][] };
}