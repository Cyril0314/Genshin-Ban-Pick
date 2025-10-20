// backend/src/ZoneSchema.ts

import { IZone, ZoneType } from "../types/IZone.ts";

export function createZoneSchema(utilityCount: number, banCount: number, pickCount: number, totalRounds: number) {
    var id = 0
    const utilityOrders = generateUtilityOrder(utilityCount)
    const utilityZones: IZone[] = utilityOrders.map((order) => { return { id: id++, type: ZoneType.UTILITY, order: order}})
    console.log(`utilityZones ${JSON.stringify(utilityZones, null, 2)}`)

    const banOrders = generateBanOrder(banCount, 8, totalRounds)
    const banZones: IZone[] = banOrders.map((order) => { return { id: id++, type: ZoneType.BAN, order: order}})
    console.log(`banZones ${JSON.stringify(banZones, null, 2)}`)

    const pickOrders = generatePickOrder(pickCount, totalRounds) 
    const leftPickZones: IZone[] = pickOrders.left.map((order) => { return { id: id++, type: ZoneType.PICK, order: order}})
    const rightPickZones: IZone[] = pickOrders.right.map((order) => { return { id: id++, type: ZoneType.PICK, order: order}})
    console.log(`leftPickZones ${JSON.stringify(leftPickZones, null, 2)}`)
    console.log(`rightPickZones ${JSON.stringify(rightPickZones, null, 2)}`)

    const zones: IZone[] = [...utilityZones, ...banZones, ... leftPickZones, ...rightPickZones]
    const zoneMetaTable: Record<string, IZone> = Object.fromEntries(zones.map(zone => [zone.id, zone]))
    console.log(`zoneMetaTable ${JSON.stringify(zoneMetaTable, null, 2)}`)

    return {
        zoneMetaTable,
        utilityZones,
        banZones,
        leftPickZones,
        rightPickZones
    }
}

function generateUtilityOrder(num: number): number[] {
    return Array.from({ length: num }, (_, i) => i)
}

function generateBanOrder(num: number, maxPerRow: number, totalRounds: number): number[] {
    const secondRoundOffset = num / totalRounds
    const rows = Math.ceil(num / maxPerRow)
    const matrix: number[][] = Array.from({ length: rows }, () => [])

    const shouldUnshift = (i: number) => {
        const isFirstHalf = i < secondRoundOffset
        const isOdd = i % 2 === 1
        return (isFirstHalf && isOdd) || (!isFirstHalf && i % 2 === 0)
    }

    let row = 0
    for (let i = 0; i < num; i++) {
        if (shouldUnshift(i)) {
            matrix[row].unshift(i)
        } else {
            matrix[row].push(i)
        }
        if ((i + 1) % maxPerRow === 0) {
            row++
        }
    }

    return matrix.flat()
}

function generatePickOrder(num: number, totalRounds: number): { left: number[]; right: number[] } {
    const offset = num / totalRounds
    const offensive: number[] = [0, 3, 4, 7, 8, 11, 12, 15]
    const defensive: number[] = [1, 2, 5, 6, 9, 10, 13, 14]
    const matrix: number[][] = [[], [], [], []]

    offensive.forEach(p => {
        matrix[0].push(p)
        matrix[2].push(offset + p)
    })
    defensive.forEach(p => {
        matrix[1].push(offset + p)
        matrix[3].push(p)
    })

    const flat = matrix.flat()

    return {
        left: flat.slice(0, num / 2),
        right: flat.slice(num / 2)
    }
}