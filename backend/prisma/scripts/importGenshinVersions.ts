// backend/prisma/scripts/importGenshinVersions.ts

import { PrismaClient } from '@prisma/client';
import fs from 'node:fs';

const prisma = new PrismaClient();
const rawData = JSON.parse(fs.readFileSync('./prisma/genshin_version.json', 'utf-8'));

function parseUTC(date: string) {
    return new Date(`${date} UTC`);
}

async function importGenshinVersions() {
    const versions = rawData
        .map((raw: any) => ({
            order: raw.order,
            code: raw.code,
            name: raw.name,
            startAt: parseUTC(raw.start_at),
            endAt: raw.end_at ? parseUTC(raw.end_at) : null,
        }))
        .sort((a: any, b: any) => a.order - b.order);

    for (const version of versions) {
        await prisma.genshinVersion.upsert({
            where: { code: version.code },
            update: {
                order: version.order,
                name: version.name,
                startAt: version.startAt,
                endAt: version.endAt,
            },
            create: version,
        });
    }

    console.log(`✅ Imported ${rawData.length} versions`);
}

async function main() {
    await importGenshinVersions();
}

(async () => {
    try {
        await main();
    } finally {
        await prisma.$disconnect();
    }
})();
