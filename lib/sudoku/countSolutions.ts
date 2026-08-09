import { Grid } from "@/types/sudoku";
import { isSafe } from "./isSafe";

export function countSolutions(grid: Grid, counter: { value: number }) {
  if (counter.value >= 2) return;

  for (let row = 0; row < 9; row++) {
    for (let col = 0; col < 9; col++) {
      if (grid[row][col] === 0) {
        for (let num = 1; num <= 9; num++) {
          if (isSafe(grid, row, col, num)) {
            grid[row][col] = num;

            countSolutions(grid, counter);

            grid[row][col] = 0;
          }
        }
        return;
      }
    }
  }
  counter.value += 1;
}
