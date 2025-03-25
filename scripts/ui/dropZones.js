import { numberOfUtilityGrids, numberOfBanGrids, numberOfPickGrids } from '../constants/constants.js';

/**
 * 建立所有 Drop Zones（utility + pick + ban）
 */
export function setupAllDropZones(characterMap) {
    addDropZonesToCenterColumn(numberOfUtilityGrids, characterMap);
    addDropZonesToColumns(numberOfPickGrids, characterMap);
    addDropZonesToRows(numberOfBanGrids, characterMap);
}

/**
 * Utility Zone（中間欄）
 */
function addDropZonesToCenterColumn(num, characterMap) {
    const columns = document.querySelectorAll('.grid-column-center');
    columns.forEach(column => {
        let currentColumn = document.createElement('div');
        let itemsInColumn = 0;

        for (let i = 0; i < num; i++) {
            const dropZone = document.createElement('div');
            dropZone.className = 'grid-item-center drop-zone';
            dropZone.setAttribute('data-zone-id', `zone-Utility ${i + 1}`);

            const span = document.createElement('span');
            span.className = 'utility-text';
            span.textContent = 'Utility';
            dropZone.appendChild(span);

            currentColumn.appendChild(dropZone);
            itemsInColumn++;

            if (itemsInColumn === 4) {
                column.appendChild(currentColumn);
                currentColumn = document.createElement('div');
                currentColumn.style.display = 'inline-block';
                currentColumn.style.verticalAlign = 'top';
                itemsInColumn = 0;
            }
        }

        if (itemsInColumn > 0) {
            column.appendChild(currentColumn);
        }
    });
}

/**
 * Pick Zone（左右欄）
 */
function addDropZonesToColumns(num, characterMap) {
    const columns = document.querySelectorAll('.grid-column');
    const numPerColumn = num / columns.length;
    console.log(`num ${num} numPerColumn ${numPerColumn} columns.length ${columns.length}`)
    const pickOrder = generatePickOrder(num);
    const pickTexts = pickOrder.map(n => `Pick ${n + 1}`);

    let index = 0;

    for (let i = 0; i < columns.length; i++) {
        for (let j = 0; j < numPerColumn; j++) {
            const dropZone = document.createElement('div');
            dropZone.className = 'grid-item drop-zone';
            dropZone.setAttribute('data-zone-id', `zone-${pickTexts[index]}`);
        
            const span = document.createElement('span');
            span.className = 'pick-text';
            span.textContent = pickTexts[index];
            dropZone.appendChild(span);
        
            columns[i].appendChild(dropZone);
            index++;
        }
    }
}


/**
 * Ban Zone（中間橫列）
 */
function addDropZonesToRows(num, characterMap) {
    const container = document.querySelector('.ban-zone-wrapper');
    const maxPerRow = 8;
    const order = generateBanOrder(num);
    let currentRow = document.createElement('div');
    currentRow.className = 'grid-row';

    for (let i = 0; i < num; i++) {
        if (i > 0 && i % maxPerRow === 0) {
            container.appendChild(currentRow);
            currentRow = document.createElement('div');
            currentRow.className = 'grid-row';
        }
        const banIndex = order[i];

        const dropZone = document.createElement('div');
        dropZone.className = 'grid-item-row drop-zone';
        dropZone.setAttribute('data-zone-id', `zone-Ban ${banIndex + 1}`);

        const span = document.createElement('span');
        span.className = 'ban-text';
        span.textContent = `Ban ${banIndex + 1}`;
        dropZone.appendChild(span);

        currentRow.appendChild(dropZone);
    }

    if (currentRow.children.length > 0) {
        container.appendChild(currentRow);
    }
}

function generateBanOrder(num) {
    const maxPerRow = 8;
    const pattern = [7, 5, 3, 1, 0, 2, 4, 6];
    const order = [];

    const totalRounds = Math.ceil(num / maxPerRow);

    for (let row = 0; row < totalRounds; row++) {
        const offset = row * maxPerRow;

        pattern.forEach(p => {
            const index = offset + p;
            if (index < num) {
                order.push(index);
            }
        });
    }

    return order;
}
export function generatePickOrder(num) {
    const cols = 4;
    const rowsPerCol = num / cols;
  
    const matrix = Array.from({ length: cols }, () => []);
  
    for (let row = 0; row < rowsPerCol; row++) {
      matrix[0].push(row * 2);                   // 左1: 奇數格中的左邊
      matrix[1].push(16 + row * 2);              // 左2: 從 17 開始，每次 +2
      matrix[2].push(16 + row * 2 + 1);          // 右2: 從 18 開始，每次 +2
      matrix[3].push(row * 2 + 1);               // 右1: 偶數格中的右邊
    }
  
    // Flatten: 先欄，再行（由上到下）
    return matrix.flat();
}