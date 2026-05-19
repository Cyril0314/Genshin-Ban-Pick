// shared/contracts/player/identitySerialization.ts
//
// PlayerIdentity ⇄ 字串序列化。
// 格式：Member:<id> / Guest:<id> / Name:<encoded-name>
//   - Member / Guest 維持與既有 auth / socket payload 的 PascalCase + 數字 id 慣例
//   - Name 走 encodeURIComponent 避免 colon、空白、特殊字元造成歧義
