// backend/prisma/scripts/importCharacters.ts

import { PrismaClient, Element, Weapon } from '@prisma/client';
import fs from 'node:fs';

import { normalizeKey, normalizeRarity, normalizeWish, normalizeModelType, normalizeRegion, normalizeRole, parseUTC } from './lib/characterData';

const prisma = new PrismaClient();
const rawData = JSON.parse(fs.readFileSync('./prisma/characters.json', 'utf-8'));

async function importCharacters() {
    for (const raw of rawData) {
        const exists = await prisma.genshinVersion.findUnique({
            where: { code: raw.version },
            select: { code: true },
        });
        if (!exists) {
            throw new Error(`❌ GenshinVersion not found for character "${raw.name}": ${raw.version}`);
        }
        const key = normalizeKey(raw.name);

        const data = {
            name: raw.name,
            rarity: normalizeRarity(raw.rarity),
            element: raw.element as Element,
            weapon: raw.weapon as Weapon,
            region: normalizeRegion(raw.region),
            modelType: normalizeModelType(raw.model_type),
            role: normalizeRole(raw.role),
            wish: normalizeWish(raw.wish),
            releaseAt: parseUTC(raw.release_at),
            genshinVersionCode: raw.version,
        };

        await prisma.character.upsert({
            where: { key },
            update: data,
            create: { key, ...data },
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
