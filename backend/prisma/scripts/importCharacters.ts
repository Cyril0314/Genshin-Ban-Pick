// backend/prisma/scripts/importCharacters.ts

import { PrismaClient, Rarity, Element, Weapon, Region, ModelType, CharacterRole, Wish } from '@prisma/client';
import fs from 'node:fs';

const prisma = new PrismaClient();
const rawData = JSON.parse(fs.readFileSync('./prisma/characters.json', 'utf-8'));

function normalizeKey(name: string): string {
    return name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '_') // 空白 & 符號 → _
        .replace(/^_+|_+$/g, ''); // 去掉頭尾底線
}

function normalizeRarity(r: string): Rarity {
    return r === '5 Stars' ? Rarity.FiveStar : Rarity.FourStar;
}

function normalizeWish(w: string): Wish {
    if (w.startsWith('Limited')) return Wish.Limited;
    if (w.startsWith('Standard')) return Wish.Standard;
    return Wish.None;
}

function normalizeModelType(m: string): ModelType {
    return m.replace(/\s+/g, '') as ModelType;
}

function normalizeRegion(r: string): Region {
    return r.replace(/\s+/g, '') as Region;
}

function normalizeRole(r: string): CharacterRole {
    return r.replace(/\s+/g, '') as CharacterRole;
}

function parseUTC(date: string) {
    return new Date(`${date} UTC`);
}

async function importCharacters() {
    for (const raw of rawData) {
        const key = normalizeKey(raw.name);

        // 1️⃣ 找對應的 version（必須存在）
        const version = await prisma.genshinVersion.findUnique({
            where: { code: raw.version },
            select: { id: true },
        });

        if (!version) {
            throw new Error(`❌ GenshinVersion not found for character "${raw.name}": ${raw.version}`);
        }

        // 2️⃣ upsert character（規格同步）
        await prisma.character.upsert({
            where: { key },
            update: {
                name: raw.name,
                rarity: normalizeRarity(raw.rarity),
                element: raw.element as Element,
                weapon: raw.weapon as Weapon,
                region: normalizeRegion(raw.region),
                modelType: normalizeModelType(raw.model_type),
                role: normalizeRole(raw.role),
                wish: normalizeWish(raw.wish),
                releaseAt: parseUTC(raw.release_at),
                genshinVersionId: version.id,
            },
            create: {
                key,
                name: raw.name,
                rarity: normalizeRarity(raw.rarity),
                element: raw.element as Element,
                weapon: raw.weapon as Weapon,
                region: normalizeRegion(raw.region),
                modelType: normalizeModelType(raw.model_type),
                role: normalizeRole(raw.role),
                wish: normalizeWish(raw.wish),
                releaseAt: parseUTC(raw.release_at),
                genshinVersionId: version.id,
            },
        });
    }

    console.log(`✅ Imported ${rawData.length} characters`);
}
async function main() {
    await importCharacters();
}

(async () => {
    try {
        await main();
    } finally {
        await prisma.$disconnect();
    }
})();
