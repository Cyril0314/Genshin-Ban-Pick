// scripts/ui/dropZones.js

/**
 * 建立所有 Drop Zones（utility + pick + ban）
 */
export function setupAllDropZones({ numberOfUtility, numberOfBan, numberOfPick, totalRounds }) {
    addDropZonesToCenterColumn(numberOfUtility);
    addDropZonesToRows(numberOfBan, totalRounds);
    addDropZonesToColumns(numberOfPick, totalRounds);
}

/**
 * Utility Zone（中間欄）
 */
function addDropZonesToCenterColumn(num) {
    const container = document.querySelector('.utility-zone__columns');
    const maxPerColumn = 4;
    let currentColumn = document.createElement('div');
    currentColumn.className = 'grid__column grid__column--center';

    for (let i = 0; i < num; i++) {
        if (i > 0 && i % maxPerColumn === 0) {
            container.appendChild(currentColumn);
            currentColumn = document.createElement('div');
            currentColumn.className = 'grid__column grid__column--center';
        }
        const dropZone = document.createElement('div');
        dropZone.className = 'grid-item__drop-zone grid-item__drop-zone--utility';
        dropZone.id = `zone-utility-${i + 1}`;

        const span = document.createElement('span');
        span.className = 'grid-item__text grid-item__text--utility';
        span.textContent = 'Utility';
        dropZone.appendChild(span);

        currentColumn.appendChild(dropZone);
    }

    if (currentColumn.children.length > 0) {
        container.appendChild(currentColumn);
    }
}

/**
 * Ban Zone（中間橫列）
 */
function addDropZonesToRows(num, totalRounds) {
    const container = document.querySelector('.ban-zone__rows');
    const maxPerRow = 8;
    const order = generateBanOrder(num, maxPerRow, totalRounds);
    let currentRow = document.createElement('div');
    currentRow.className = 'grid__row';

    for (let i = 0; i < num; i++) {
        if (i > 0 && i % maxPerRow === 0) {
            container.appendChild(currentRow);
            currentRow = document.createElement('div');
            currentRow.className = 'grid__row';
        }
        const banIndex = order[i];
        const banText = `Ban ${banIndex + 1}`

        const dropZone = document.createElement('div');
        dropZone.className = 'grid-item__drop-zone grid-item__drop-zone--ban';
        dropZone.id = `zone-ban-${banIndex + 1}`;

        const span = document.createElement('span');
        span.className = 'grid-item__text grid-item__text--ban';
        span.textContent = banText;
        dropZone.appendChild(span);

        currentRow.appendChild(dropZone);
    }

    if (currentRow.children.length > 0) {
        container.appendChild(currentRow);
    }
}

/**
 * Pick Zone（左右欄）
 */
function addDropZonesToColumns(num, totalRounds) {
    const columns = document.querySelectorAll('.grid__column.grid__column--side');
    const numPerColumn = num / columns.length;
    // console.log(`num ${num} numPerColumn ${numPerColumn} columns.length ${columns.length}`)
    const order = generatePickOrder(num, totalRounds);

    for (let i = 0; i < columns.length; i++) {
        for (let j = 0; j < numPerColumn; j++) {
            const index = i * numPerColumn + j
            const pickIndex = order[index]
            const pickText = `Pick ${pickIndex + 1}`

            const dropZone = document.createElement('div');
            dropZone.className = 'grid-item__drop-zone grid-item__drop-zone--pick';
            dropZone.id =`zone-pick-${pickIndex + 1}`;

            const span = document.createElement('span');
            span.className = 'grid-item__text grid-item__text--pick';
            span.textContent = pickText;
            dropZone.appendChild(span);

            columns[i].appendChild(dropZone);
        }
    }
}

function generateBanOrder(num, maxPerRow, totalRounds) {
    const secondRoundOffset = num / totalRounds;
    const rows = Math.ceil(num / maxPerRow)
    const matrix = Array.from({ length: rows }, () => []);

    const shouldUnshift = (i) => {
        const isFirstHalf = i < secondRoundOffset;
        const isOdd = i % 2 === 1;
        return (isFirstHalf && isOdd) || (!isFirstHalf && i % 2 === 0);
    };

    var row = 0;
    for (let i = 0; i < num; i++) {
        if (shouldUnshift(i)) {
            matrix[row].unshift(i);
        } else {
            matrix[row].push(i);
        }
        if ((i + 1) % maxPerRow === 0) {
            row++;
        }
    }

    return matrix.flat();
}

function generatePickOrder(num, totalRounds) {
    const offensivePattern = [0, 3, 4, 7, 8, 11, 12, 15];
    const defensivePattern = [1, 2, 5, 6, 9, 10, 13, 14];
    const cols = 4;
    const matrix = Array.from({ length: cols }, () => []);
    const secondRoundOffset = num / totalRounds;

    offensivePattern.forEach(p => {
        matrix[0].push(p);
        matrix[2].push(secondRoundOffset + p);
    });

    defensivePattern.forEach(p => {
        matrix[1].push(secondRoundOffset + p);
        matrix[3].push(p);
    });

    // Flatten: 先欄，再行（由上到下）
    return matrix.flat();
}
