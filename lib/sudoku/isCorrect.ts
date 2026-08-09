import { Grid } from "@/types/sudoku";

export function isCorrect(puzzle: Grid, solution: Grid): boolean {
  for (let row = 0; row < 9; row++) {
    for (let col = 0; col < 9; col++) {
      if (puzzle[row][col] !== 0) {
        if (puzzle[row][col] !== solution[row][col]) {
          return false;
        }
      }
    }
  }
  return true;
}
