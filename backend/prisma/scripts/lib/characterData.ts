// backend/prisma/scripts/lib/characterData.ts
//
// Single source of truth for turning a raw characters.json row into the shape
// the seed writes, plus the pre-import validation the orchestrator runs. The
// seed (importCharacters.ts) and the validator (importGameData.ts) share these
// helpers so "what counts as valid" can never drift from "what gets cast".

import { existsSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { Rarity, Element, Weapon, Region, ModelType, CharacterRole, Wish } from '@prisma/client';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// lib → scripts → prisma → backend → repo root → genshin-ban-pick/src/assets/images
export const IMAGES_ROOT = path.resolve(__dirname, '../../../../genshin-ban-pick/src/assets/images');

export interface RawCharacter {
    icon: string;
    name: string;
    rarity: string;
    element: string;
    weapon: string;
    region: string;
    model_type: string;
    release_at: string;
    version: string;
    role: string;
    wish: string;
}

export interface RawVersion {
    code: string;
}

export function normalizeKey(name: string): string {
    return name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '_') // 空白 & 符號 → _
        .replace(/^_+|_+$/g, ''); // 去掉頭尾底線
}

export function normalizeRarity(r: string): Rarity {
    return r === '5 Stars' ? Rarity.FiveStar : Rarity.FourStar;
}

export function normalizeWish(w: string): Wish {
    if (w.startsWith('Limited')) return Wish.Limited;
    if (w.startsWith('Standard')) return Wish.Standard;
    return Wish.None;
}

export function normalizeModelType(m: string): ModelType {
    return m.replace(/\s+/g, '') as ModelType;
}

export function normalizeRegion(r: string): Region {
    return r.replace(/\s+/g, '') as Region;
}

export function normalizeRole(r: string): CharacterRole {
    return r.replace(/\s+/g, '') as CharacterRole;
}

export function parseUTC(date: string) {
    return new Date(`${date} UTC`);
}

// Mirror of imageRegistry.ts toPascalCase — the character key (normalizeKey)
// drives the on-disk image filename, e.g. sangonomiya_kokomi → SangonomiyaKokomi.
function toPascalCase(key: string): string {
    return key
        .split('_')
        .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
        .join('');
}

function isEnumMember<T extends Record<string, string>>(enumObj: T, value: string): boolean {
    return (Object.values(enumObj) as string[]).includes(value);
}

/**
 * Validate every character row against the enum contracts, the version index,
 * and the on-disk image assets — before anything touches the DB. Returns a flat
 * list of human-readable errors (empty = all good).
 */
export function validateCharacters(characters: RawCharacter[], versions: RawVersion[]): string[] {
    const errors: string[] = [];
    const versionCodes = new Set(versions.map((v) => v.code));

    for (const raw of characters) {
        const where = `character "${raw.name}"`;

        // Fields cast directly to a Prisma enum — a bad value is a hard seed crash.
        if (!isEnumMember(Element, raw.element)) {
            errors.push(`${where}: invalid element "${raw.element}" (expected one of ${Object.values(Element).join(', ')})`);
        }
        if (!isEnumMember(Weapon, raw.weapon)) {
            errors.push(`${where}: invalid weapon "${raw.weapon}" (expected one of ${Object.values(Weapon).join(', ')})`);
        }
        if (!isEnumMember(Region, normalizeRegion(raw.region))) {
            errors.push(`${where}: invalid region "${raw.region}" (expected one of ${Object.values(Region).join(', ')})`);
        }
        if (!isEnumMember(ModelType, normalizeModelType(raw.model_type))) {
            errors.push(`${where}: invalid model_type "${raw.model_type}" (expected one of ${Object.values(ModelType).join(', ')})`);
        }
        if (!isEnumMember(CharacterRole, normalizeRole(raw.role))) {
            errors.push(`${where}: invalid role "${raw.role}" (expected one of ${Object.values(CharacterRole).join(', ')})`);
        }

        // Fields mapped with a silent fallback — flag unknown values so they don't
        // seed as the wrong enum without warning.
        if (raw.rarity !== '5 Stars' && raw.rarity !== '4 Stars') {
            errors.push(`${where}: unexpected rarity "${raw.rarity}" (expected "5 Stars" or "4 Stars")`);
        }
        if (!/^(Limited|Standard|None)/.test(raw.wish)) {
            errors.push(`${where}: unexpected wish "${raw.wish}" (would silently seed as Wish.None)`);
        }

        // release_at must parse to a real date (parseUTC on garbage → Invalid Date).
        if (Number.isNaN(parseUTC(raw.release_at).getTime())) {
            errors.push(`${where}: unparseable release_at "${raw.release_at}"`);
        }

        // Version must already exist in genshin_version.json (seed throws otherwise).
        if (!versionCodes.has(raw.version)) {
            errors.push(`${where}: version "${raw.version}" not found in genshin_version.json (add the version first)`);
        }

        // profile/ (.webp) and wish/ (.png) must both exist under the PascalCase key.
        const pascal = toPascalCase(normalizeKey(raw.name));
        const profilePath = path.join(IMAGES_ROOT, 'profile', `${pascal}_Profile.webp`);
        const wishPath = path.join(IMAGES_ROOT, 'wish', `${pascal}_Wish.png`);
        if (!existsSync(profilePath)) {
            errors.push(`${where}: missing profile image ${path.relative(IMAGES_ROOT, profilePath)}`);
        }
        if (!existsSync(wishPath)) {
            errors.push(`${where}: missing wish image ${path.relative(IMAGES_ROOT, wishPath)}`);
        }
    }

    return errors;
}
