// src/features/BanPick/composables/useBanPickOrder.ts

export function generateUtilityOrder(num: number): number[] {
    return Array.from({ length: num }, (_, i) => i)
}

export function generateBanOrder(
    num: number,
    maxPerRow: number,
    totalRounds: number
): number[] {
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

export function generatePickOrder(
    num: number,
    totalRounds: number
): { left: number[]; right: number[] } {
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