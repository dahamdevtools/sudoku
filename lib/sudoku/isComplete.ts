import { Grid } from "@/types/sudoku";

export function isComplete(puzzle: Grid) {
  for (let row = 0; row < 9; row++) {
    for (let col = 0; col < 9; col++) {
      if (puzzle[row][col] === 0) {
        return false;
      }
    }
  }
  return true;
}
