// Uniform spatial hash grid — O(1) insert, O(k) range query where k = candidates in nearby cells.
class SpatialGrid {
  constructor(cellSize) {
    this.cellSize = cellSize;
    this.cells = new Map();
  }

  clear() { this.cells.clear(); }

  insert(item) {
    const k = this._key(item.x, item.y);
    let cell = this.cells.get(k);
    if (!cell) { cell = []; this.cells.set(k, cell); }
    cell.push(item);
  }

  query(x, y, radius) {
    const out = [];
    const cs = this.cellSize;
    const x0 = ((x - radius) / cs) | 0;
    const x1 = ((x + radius) / cs) | 0;
    const y0 = ((y - radius) / cs) | 0;
    const y1 = ((y + radius) / cs) | 0;
    for (let cx = x0; cx <= x1; cx++) {
      for (let cy = y0; cy <= y1; cy++) {
        const cell = this.cells.get(cx + ',' + cy);
        if (cell) for (const item of cell) out.push(item);
      }
    }
    return out;
  }

  _key(x, y) {
    return ((x / this.cellSize) | 0) + ',' + ((y / this.cellSize) | 0);
  }
}
