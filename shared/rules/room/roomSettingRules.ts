// 房間設定的數量規則。前端用來預覽房主會拿到的實際數字，後端用同一份當作真正的來源。

// 兩隊制是整個 app 的前提（teams[0]/teams[1]、盤面 left/right、蛇行順序都假設兩隊），
// 這裡的 2 與之對應，不是可調參數。
export const NUMBER_OF_TEAMS = 2;

/**
 * Ban/Pick 數量補到能被回合數整除，且每回合為偶數（互選/蛇行每回合要兩隊各半）。
 * Pick 另外傳 `charactersPerSetup`：每隊總 Pick 數還要能排滿整組陣容（4 格一組）。
 * 只往上補，不往下砍：8 bans / 3 rounds => 12；32 picks / 3 rounds / 4 per setup => 48。
 */
export function alignZoneCountToRounds(count: number, totalRounds: number, charactersPerSetup = 1): number {
    const unit = NUMBER_OF_TEAMS * lcm(totalRounds, charactersPerSetup);
    return Math.ceil(count / unit) * unit;
}

/** 陣容組數跟著 Pick 數走：每隊的 Pick 全部排進陣容，一組 charactersPerSetup 格。 */
export function deriveNumberOfTeamSetup(numberOfPick: number, charactersPerSetup: number): number {
    return numberOfPick / NUMBER_OF_TEAMS / charactersPerSetup;
}

function lcm(a: number, b: number): number {
    return (a * b) / gcd(a, b);
}

function gcd(a: number, b: number): number {
    return b === 0 ? a : gcd(b, a % b);
}
