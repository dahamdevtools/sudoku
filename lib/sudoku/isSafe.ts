import { Grid } from "@/types/sudoku";

export function isSafe(
  grid: Grid,
  row: number,
  col: number,
  num: number,
): boolean {
  for (let i = 0; i < 9; i++) {
    if (grid[row][i] === num) return false;
  }

  for (let i = 0; i < 9; i++) {
    if (grid[i][col] === num) return false;
  }

  const gridStartsAtRow = row - (row % 3);
  const gridStartsAtCol = col - (col % 3);

  for (let r = gridStartsAtRow; r < gridStartsAtRow + 3; r++) {
    for (let c = gridStartsAtCol; c < gridStartsAtCol + 3; c++) {
      if (grid[r][c] === num) return false;
    }
  }

  return true;
}
