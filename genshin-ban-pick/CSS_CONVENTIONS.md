# Vue CSS 命名規範

在 `<style scoped>` + CSS custom properties (design tokens) 的基礎上，採用三條規則
讓 class 命名更清晰、減少冗餘。

## 為什麼不用完整 BEM

`<style scoped>` 會把 class 自動加 hash 隔離（`.foo` → `.foo[data-v-xxx]`），
**全域命名衝突的問題在這個專案不存在**。BEM 那種 `.block__element--modifier`
是為了無 scope 的傳統 CSS 設計的，在 scoped 環境繼續寫等於**繳兩次防撞稅**。

## 三條規則

### Rule 1: 一檔案一 block，子層用簡名

`<style scoped>` 內的 class 名只在這個 `.vue` 檔有效，不會撞別人。
所以子層用簡單 semantic 名就好，不用 `__` 前綴。

```html
<!-- ❌ 過度防禦 -->
<div class="room-user-pool">
    <ul class="room-user-pool__users">
        <li class="room-user-pool__user">
            <span class="room-user-pool__label">...</span>
        </li>
    </ul>
</div>

<!-- ✅ 簡名 (scoped 隔離) -->
<div class="room-user-pool">
    <ul class="users">
        <li class="user">
            <span class="label">...</span>
        </li>
    </ul>
</div>
```

**外層 block 用 kebab-case 元件名**（例如 `room-user-pool`、`drop-zone`），
作為這個元件的「唯一識別」— 雖然 scoped 保護過，但對 reader 清晰、
DevTools 看 class 一眼認得是哪個 component。

**不要同檔同時有多個獨立 block** — 例如 `.container__*` / `.users__*` / `.user__*`
三個 block 都出現在同一個 `.vue`，這是 BEM 用錯的徵兆。

---

### Rule 2: Variant 用 `--`，State 用 `is-`

`--` 是「**變體**」(variant) — 永久的、結構性的差異。
`is-` 是「**狀態**」(state) — 暫時的、會切換的條件。

```html
<!-- ❌ 全部都用 -- 看不出差別 -->
<div class="drop-zone drop-zone--ban drop-zone--active">

<!-- ✅ 兩者分開 -->
<div class="drop-zone drop-zone--ban is-active">
```

判斷標準：

| 是 variant | 是 state |
| --- | --- |
| `drop-zone--ban` (這格永遠是 ban) | `is-active` (使用者正拖過來) |
| `button--primary` (這顆永遠是 primary) | `is-loading` (正在 fetch) |
| `card--horizontal` (這張卡的版型) | `is-selected` (使用者點了) |
| `pick-zone--left` (左邊那一格) | `is-disabled` (條件不符) |
| 寫進 markup 就決定的 | 由 `:class="{ ... }"` 動態切換的 |

CSS 對應：

```css
/* variant */
.drop-zone--ban { background: var(--ban-color); }

/* state */
.drop-zone.is-active { outline: 2px solid currentColor; }
.drop-zone.is-loading { opacity: 0.5; pointer-events: none; }
```

Template 對應：

```html
<!-- variant: 寫死或 prop 決定 -->
<div :class="`drop-zone--${zone.type}`">

<!-- state: 響應式 -->
<div :class="{ 'is-active': isOver, 'is-highlighted': isHighlighted }">
```

---

### Rule 3: Design tokens 不變

繼續沿用 `--md-sys-color-*` (Material 3) + 自訂 `--space-*` / `--font-size-*` /
`--radius-*` / `--font-family-*`。

**所有顏色、間距、字型、圓角都走 token，不要寫死值**：

```css
/* ❌ */
.button {
    background: #ef ac 30;
    padding: 12px 20px;
    border-radius: 8px;
}

/* ✅ */
.button {
    background: var(--md-sys-color-primary);
    padding: var(--space-sm) var(--space-md);
    border-radius: var(--radius-md);
}
```

Token 定義在 `src/assets/styles/semantic-colors.css` 跟 `src/assets/base.css`。

---

## 完整範例

```vue
<!-- DropZone.vue -->
<template>
  <div
    class="drop-zone"
    :class="[
      `drop-zone--${props.zone.type || 'default'}`,
      { 'is-active': isOver, 'is-highlighted': isHighlighted }
    ]">
    <template v-if="imageId">
      <img class="background" :src="..." />
      <img class="image" :src="..." />
    </template>
    <span v-else class="label">{{ label }}</span>
  </div>
</template>

<style scoped>
/* 元件 root block */
.drop-zone {
    background: var(--md-sys-color-surface-container-low);
    border-radius: var(--radius-md);
    /* ... */
}

/* 子層：簡名 */
.background { ... }
.image { ... }
.label {
    font-size: var(--font-size-sm);
    font-family: var(--font-family-tech-ui);
}

/* state */
.drop-zone.is-active { outline: 2px solid ...; }
.drop-zone.is-highlighted { box-shadow: ...; }

/* variant 通常不用寫 class CSS，只是當錨點給 :class 用 */
/* 真有共通變體樣式才寫，例如 .drop-zone--ban { background: var(--ban-color); } */
</style>
```

---

## 例外情境

**1. 需要在父元件強制改子元件樣式 → 用 `:deep()`**
```vue
<style scoped>
.parent :deep(.child-class) {
    /* 穿過 scoped 邊界 */
}
</style>
```

**2. 真正的全域樣式（例如 reset、token、第三方覆寫）**
寫在 `src/assets/*.css`，不放 component scoped block。

**3. 跨元件重用的 design system component**（按鈕、卡片這類）
可以考慮加 BEM 命名（提高 explicit），或直接抽成 Vue component。

---

## 遷移策略

舊檔不主動重寫。**touch-time migration**：
- 哪個 `.vue` 你下次有需求改，順手套這套規則改完
- 不要為了改 CSS 命名單獨開 PR 大改一輪

已遷移的範例參考：
- `src/modules/board/ui/components/DropZone.vue`

---

## 反 pattern 速查

| ❌ 不要 | ✅ 改成 |
| --- | --- |
| `.container__users` `.user__label` 同檔多 block | 一個 root block + 簡名子層 |
| `.tab--active` 表示狀態 | `.is-active` |
| `.highlight` 沒前綴 | `.is-highlighted` (state) 或 `.block--highlight` (variant) |
| 寫死顏色 `#ef ac 30` | `var(--md-sys-color-primary)` |
| 寫死間距 `padding: 12px` | `padding: var(--space-md)` |
| 用 element selector `.chat__window button` | 給 button 一個 class（`.send-button` 之類） |
