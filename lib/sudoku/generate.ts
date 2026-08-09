import { Grid } from "@/types/sudoku";
import { isSafe } from "./isSafe";
import { shuffle } from "./shuffle";

export function generate(grid: Grid): boolean {
  for (let row = 0; row < 9; row++) {
    for (let col = 0; col < 9; col++) {
      if (grid[row][col] === 0) {
        const numbersToTry = shuffle([1, 2, 3, 4, 5, 6, 7, 8, 9]);

        for (const num of numbersToTry) {
          if (isSafe(grid, row, col, num)) {
            grid[row][col] = num;

            if (generate(grid)) {
              return true;
            }

            grid[row][col] = 0;
          }
        }
        return false;
      }
    }
  }
  return true;
}
