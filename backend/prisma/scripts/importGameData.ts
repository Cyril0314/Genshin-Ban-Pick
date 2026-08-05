// backend/prisma/scripts/importGameData.ts
//
// One-shot "add a character / version" pipeline. Assumes you have already:
//   1. added the version row to prisma/genshin_version.json (if new),
//   2. added the character row to prisma/characters.json,
//   3. dropped <Name>_Profile.webp and <Name>_Wish.png into the frontend assets.
//
// Then run `npm run add:character` from backend/. It validates the data +
// assets, regenerates the image manifest, seeds versions then characters, and
// type-checks the frontend — failing fast before anything touches the DB.

import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { validateCharacters, type RawCharacter, type RawVersion } from './lib/characterData';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const BACKEND_DIR = path.resolve(__dirname, '../..');
const REPO_ROOT = path.resolve(__dirname, '../../..');
const FRONTEND_DIR = path.join(REPO_ROOT, 'genshin-ban-pick');
const ENV_FILE = path.join(REPO_ROOT, '.env');

const STEPS = 5;
let step = 0;

function heading(label: string) {
    step += 1;
    console.log(`\n\x1b[1m[${step}/${STEPS}] ${label}\x1b[0m`);
}

function run(command: string, args: string[], cwd: string) {
    execFileSync(command, args, { cwd, stdio: 'inherit' });
}

function main() {
    // [1/5] Validate JSON + assets (pure, no DB) so a typo never half-seeds the DB.
    heading('validate characters.json + images');
    const characters = JSON.parse(fs.readFileSync(path.join(BACKEND_DIR, 'prisma/characters.json'), 'utf-8')) as RawCharacter[];
    const versions = JSON.parse(fs.readFileSync(path.join(BACKEND_DIR, 'prisma/genshin_version.json'), 'utf-8')) as RawVersion[];
    const errors = validateCharacters(characters, versions);
    if (errors.length > 0) {
        console.error(`\x1b[31m✗ ${errors.length} validation error(s):\x1b[0m`);
        for (const error of errors) {
            console.error(`  • ${error}`);
        }
        process.exit(1);
    }
    console.log(`✓ ${characters.length} characters / ${versions.length} versions valid`);

    // [2/5] Regenerate the typed image manifest from the assets on disk.
    heading('gen:images (image manifest)');
    run('npm', ['--prefix', FRONTEND_DIR, 'run', 'gen:images'], REPO_ROOT);

    // [3/5] Seed versions first — characters FK onto version codes.
    heading('seed genshin versions');
    run('npx', ['tsx', `--env-file=${ENV_FILE}`, 'prisma/scripts/importGenshinVersions.ts'], BACKEND_DIR);

    // [4/5] Seed characters (upsert by key — safe to re-run).
    heading('seed characters');
    run('npx', ['tsx', `--env-file=${ENV_FILE}`, 'prisma/scripts/importCharacters.ts'], BACKEND_DIR);

    // [5/5] Type-check confirms manifest coverage (profile/wish 1:1, enum icons).
    heading('type-check frontend');
    run('npm', ['--prefix', FRONTEND_DIR, 'run', 'type-check'], REPO_ROOT);

    console.log('\n\x1b[32m✓ Done — game data imported.\x1b[0m');
}

try {
    main();
} catch (error) {
    console.error(`\n\x1b[31m✗ Pipeline failed:\x1b[0m ${error instanceof Error ? error.message : error}`);
    process.exit(1);
}
