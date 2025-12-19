// backend/prisma/seed.ts

import { PrismaClient, Rarity, Element, Weapon, Region, ModelType, CharacterRole, Wish } from '@prisma/client';
import fs from 'node:fs';

// const prisma = new PrismaClient();
// const charactersRawData = JSON.parse(fs.readFileSync('./prisma/characters.json', 'utf-8'));
// const versionsRawData = JSON.parse(fs.readFileSync('./prisma/genshin_version.json', 'utf-8'));

// (async () => {
//     await main();
//     await prisma.$disconnect();
// })();

// async function main() {
//     await seedGenshinVersion();
//     await seedCharacter();
// }

// async function seedCharacter() {
//     const characters = charactersRawData
//         .map((raw: any) => ({
//             key: normalizeKey(raw.name),
//             name: raw.name,
//             rarity: normalizeRarity(raw.rarity),
//             element: raw.element as Element,
//             weapon: raw.weapon as Weapon,
//             region: normalizeRegion(raw.region),
//             modelType: normalizeModelType(raw.model_type),
//             role: normalizeRole(raw.role),
//             wish: normalizeWish(raw.wish),
//             releaseDate: new Date(raw.release_date),
//             version: raw.version,
//         }))
//         .sort((a: any, b: any) => a.releaseDate.getTime() - b.releaseDate.getTime());

//     await prisma.character.createMany({
//         data: characters,
//         skipDuplicates: true, // 防止重複執行 seed
//     });

//     console.log(`✅ Done! Inserted ${characters.length} characters.`);
// }

// async function seedGenshinVersion() {
//     for (const version of versionsRawData) {
//         await prisma.genshinVersion.upsert({
//             where: { code: version.code },
//             update: {}, // 不動既有資料
//             create: {
//                 order: version.order,
//                 code: version.code,
//                 name: version.name,
//                 startAt: parseUTC(version.startAt),
//                 endAt: version.endAt ? parseUTC(version.endAt) : null,
//             },
//         });
//     }
// }
