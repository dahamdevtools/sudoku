import { Grid } from "@/types/sudoku";
import { countSolutions } from "./countSolutions";
import { shuffle } from "./shuffle";

export function removeCells(grid: Grid, emptySlots: number): Grid {
  const cells: number[][] = [];
  for (let row = 0; row < 9; row++) {
    for (let col = 0; col < 9; col++) {
      cells.push([row, col]);
    }
  }
  const shuffledCells = shuffle(cells);
  const removedCells = [];

  for (
    let i = 0;
    removedCells.length < emptySlots && i < shuffledCells.length;
    i++
  ) {
    const [row, col] = shuffledCells[i];

    if (grid[row][col] !== 0) {
      const value = grid[row][col];
      grid[row][col] = 0;

      const testGrid = structuredClone(grid);
      const counter = { value: 0 };
      countSolutions(testGrid, counter);

      if (counter.value === 1) {
        removedCells.push([row, col]);
      } else {
        grid[row][col] = value;
      }
    }
  }

  return grid;
}
