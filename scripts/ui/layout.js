/**
 * 設定中間那一行格子：加中線、margin
 */
export function setupLayoutRules() {
    const allRows = document.querySelectorAll('.grid-row');

    allRows.forEach(row => {
        const items = row.querySelectorAll('.grid-item-row');
        const middle = Math.floor(items.length / 2); // 精確中線 index

        items.forEach((item, index) => {
            const isSplitPoint = index === middle - 1;

            if (isSplitPoint) {
                item.style.marginRight = '20px';

                const divider = document.createElement('div');
                divider.style.position = 'absolute';
                divider.style.left = '100%';
                divider.style.transform = 'translateX(12.5px)';
                divider.style.top = '0';
                divider.style.bottom = '0';
                divider.style.borderRight = '2px solid #4e4040';
                divider.style.height = '100%';
                divider.style.content = "''";

                item.appendChild(divider);
            }
        });
    });
}