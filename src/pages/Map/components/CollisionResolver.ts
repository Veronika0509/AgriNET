export class CollisionResolver {
    private static timerId: NodeJS.Timeout;
    private static readonly MAX_ITERATIONS = 15;
    private static readonly MIN_SPACING = 2; // Минимальный отступ между оверлеями

    static resolve(overlays: any[], isMobilePlatform: boolean) {
        if (isMobilePlatform && overlays.length > 30) return;

        clearTimeout(this.timerId);
        this.timerId = setTimeout(() => {
            this.organizeOverlaysInGrid(overlays);
            this.checkCollisions(overlays);
        }, 100);
    }

    private static organizeOverlaysInGrid(overlays: any[]) {
        // Сначала получаем размеры всех оверлеев
        const overlaysSizes = overlays.map(overlay => {
            const div = overlay.getDiv();
            if (!div) return { width: 0, height: 0 };
            const bounds = div.getBoundingClientRect();
            return {
                width: bounds.width,
                height: bounds.height
            };
        });

        // Находим максимальные размеры для расчета сетки
        const maxWidth = Math.max(...overlaysSizes.map(size => size.width));
        const maxHeight = Math.max(...overlaysSizes.map(size => size.height));

        overlays.sort((a, b) => {
            const divA = a.getDiv();
            const divB = b.getDiv();
            if (!divA || !divB) return 0;

            const boundsA = divA.getBoundingClientRect();
            const boundsB = divB.getBoundingClientRect();

            // Сортируем сначала по размеру (большие первые), затем по позиции
            const sizeA = boundsA.width * boundsA.height;
            const sizeB = boundsB.width * boundsB.height;
            if (sizeA !== sizeB) return sizeB - sizeA;

            const distA = boundsA.left + boundsA.top;
            const distB = boundsB.left + boundsB.top;
            return distA - distB;
        });

        // Рассчитываем оптимальное количество колонок
        const numOverlays = overlays.length;
        const numCols = Math.ceil(Math.sqrt(numOverlays));
        const numRows = Math.ceil(numOverlays / numCols);

        // Создаем сетку для отслеживания занятых ячеек
        const grid: boolean[][] = Array(numRows).fill(null)
            .map(() => Array(numCols).fill(false));

        overlays.forEach((overlay, index) => {
            const div = overlay.getDiv();
            if (!div) return;

            const basePosition = this.getBasePosition(overlay);
            if (!basePosition) return;

            const bounds = div.getBoundingClientRect();
            const cellsNeededH = Math.ceil(bounds.width / maxWidth);
            const cellsNeededV = Math.ceil(bounds.height / maxHeight);

            // Находим свободное место в сетке для текущего оверлея
            const position = this.findFreeGridPosition(grid, cellsNeededH, cellsNeededV);
            const row = position.row;
            const col = position.col;

            // Помечаем ячейки как занятые
            for (let r = row; r < row + cellsNeededV && r < numRows; r++) {
                for (let c = col; c < col + cellsNeededH && c < numCols; c++) {
                    grid[r][c] = true;
                }
            }

            // Рассчитываем позицию с учетом размера оверлея
            const offsetX = col * (maxWidth + this.MIN_SPACING);
            const offsetY = row * (maxHeight + this.MIN_SPACING);

            // Центрируем сетку
            const gridCenterOffsetX = ((numCols - 1) * (maxWidth + this.MIN_SPACING)) / 2;
            const gridCenterOffsetY = ((numRows - 1) * (maxHeight + this.MIN_SPACING)) / 2;

            div.style.left = `${basePosition.x + offsetX - gridCenterOffsetX}px`;
            div.style.top = `${basePosition.y + offsetY - gridCenterOffsetY}px`;

            if (!overlay.offset) overlay.offset = { x: 0, y: 0 };
            overlay.offset.x = offsetX - gridCenterOffsetX;
            overlay.offset.y = offsetY - gridCenterOffsetY;
        });
    }

    private static findFreeGridPosition(grid: boolean[][], neededWidth: number, neededHeight: number) {
        const numRows = grid.length;
        const numCols = grid[0].length;

        for (let row = 0; row < numRows; row++) {
            for (let col = 0; col < numCols; col++) {
                if (this.canPlaceOverlay(grid, row, col, neededHeight, neededWidth)) {
                    return { row, col };
                }
            }
        }
        return { row: 0, col: 0 }; // Fallback position
    }

    private static canPlaceOverlay(
        grid: boolean[][],
        startRow: number,
        startCol: number,
        height: number,
        width: number
    ): boolean {
        const numRows = grid.length;
        const numCols = grid[0].length;

        if (startRow + height > numRows || startCol + width > numCols) {
            return false;
        }

        for (let row = startRow; row < startRow + height; row++) {
            for (let col = startCol; col < startCol + width; col++) {
                if (grid[row][col]) {
                    return false;
                }
            }
        }
        return true;
    }

    private static getBasePosition(overlay: any) {
        const div = overlay.getDiv();
        if (!div) return null;

        const projection = overlay.getProjection();
        if (!projection) return null;

        const position = overlay.bounds.getCenter();
        const pixel = projection.fromLatLngToDivPixel(position);

        return pixel ? { x: pixel.x, y: pixel.y } : null;
    }

    private static checkCollisions(overlays: any[], iteration: number = 0) {
        if (iteration >= this.MAX_ITERATIONS) return;

        let hasCollisions = false;
        const processed = new Set<string>();

        for (let i = 0; i < overlays.length; i++) {
            for (let j = i + 1; j < overlays.length; j++) {
                const overlay1 = overlays[i];
                const overlay2 = overlays[j];

                const pairKey = `${i}-${j}`;
                if (processed.has(pairKey)) continue;

                const collision = this.checkForOverlap(overlay1, overlay2);
                if (collision) {
                    this.resolveCollision(overlay1, overlay2, collision);
                    hasCollisions = true;
                    processed.add(pairKey);
                }
            }
        }

        if (hasCollisions) {
            setTimeout(() => this.checkCollisions(overlays, iteration + 1), 0);
        }
    }

    private static checkForOverlap(overlay1: any, overlay2: any) {
        const div1 = overlay1.getDiv();
        const div2 = overlay2.getDiv();
        if (!div1 || !div2) return null;

        const bounds1 = div1.getBoundingClientRect();
        const bounds2 = div2.getBoundingClientRect();

        const overlapX = Math.max(0,
            Math.min(bounds1.right, bounds2.right) -
            Math.max(bounds1.left, bounds2.left)
        );

        const overlapY = Math.max(0,
            Math.min(bounds1.bottom, bounds2.bottom) -
            Math.max(bounds1.top, bounds2.top)
        );

        if (overlapX > 0 && overlapY > 0) {
            return {
                x: overlapX,
                y: overlapY,
                isVertical: Math.abs(bounds1.top - bounds2.top) < Math.abs(bounds1.left - bounds2.left)
            };
        }

        return null;
    }

    private static resolveCollision(overlay1: any, overlay2: any, collision: any) {
        const div1 = overlay1.getDiv();
        const div2 = overlay2.getDiv();
        if (!div1 || !div2) return;

        const bounds1 = div1.getBoundingClientRect();
        const bounds2 = div2.getBoundingClientRect();

        const centerDiffX = bounds2.left - bounds1.left;
        const centerDiffY = bounds2.top - bounds1.top;

        const moveX = (centerDiffX > 0 ? 1 : -1) * collision.x / 2;
        const moveY = (centerDiffY > 0 ? 1 : -1) * collision.y / 2;

        this.moveElement(overlay1, -moveX, -moveY);
        this.moveElement(overlay2, moveX, moveY);

        overlay1.draw();
        overlay2.draw();
    }

    private static moveElement(overlay: any, x: number, y: number) {
        const div = overlay.getDiv();
        if (!div) return;

        const currentLeft = parseFloat(div.style.left) || 0;
        const currentTop = parseFloat(div.style.top) || 0;

        const newLeft = Math.round(currentLeft + x);
        const newTop = Math.round(currentTop + y);

        div.style.left = `${newLeft}px`;
        div.style.top = `${newTop}px`;

        if (!overlay.offset) overlay.offset = { x: 0, y: 0 };
        overlay.offset.x += x;
        overlay.offset.y += y;
    }
}

