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

(async () => {
    const characters = rawData
        .map((raw: any) => ({
            key: normalizeKey(raw.name),
            name: raw.name,
            rarity: normalizeRarity(raw.rarity),
            element: raw.element as Element,
            weapon: raw.weapon as Weapon,
            region: normalizeRegion(raw.region),
            modelType: normalizeModelType(raw.model_type),
            releaseDate: new Date(raw.release_date),
            version: raw.version,
            role: normalizeRole(raw.role),
            wish: normalizeWish(raw.wish),
        }))
        .sort((a: any, b: any) => a.releaseDate.getTime() - b.releaseDate.getTime());

    await prisma.character.createMany({
        data: characters,
        skipDuplicates: true, // 防止重複執行 seed
    });

    console.log(`✅ Done! Inserted ${characters.length} characters.`);
    await prisma.$disconnect();
})();
