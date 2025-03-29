/**
 * 建立所有 Drop Zones（utility + pick + ban）
 */
export function setupAllDropZones({numberOfUtility, numberOfBan, numberOfPick, totalRounds}) {
    addDropZonesToCenterColumn(numberOfUtility);
    addDropZonesToRows(numberOfBan, totalRounds);
    addDropZonesToColumns(numberOfPick, totalRounds);
}

/**
 * Utility Zone（中間欄）
 */
function addDropZonesToCenterColumn(num) {
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
function addDropZonesToColumns(num, totalRounds) {
    const columns = document.querySelectorAll('.grid-column');
    const numPerColumn = num / columns.length;
    console.log(`num ${num} numPerColumn ${numPerColumn} columns.length ${columns.length}`)
    const pickOrder = generatePickOrder(num, totalRounds);
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
function addDropZonesToRows(num, totalRounds) {
    const container = document.querySelector('.ban-zone-wrapper');
    const maxPerRow = 8;
    const order = generateBanOrder(num, maxPerRow, totalRounds);
    console.log(`${order}`)
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
