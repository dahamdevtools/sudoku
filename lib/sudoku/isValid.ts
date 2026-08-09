import { Grid } from "@/types/sudoku";

function hasNoDuplicates(cells: number[]): boolean {
  const filled = cells.filter((n) => n !== 0);
  const uniqueValues = new Set(filled);
  return uniqueValues.size === filled.length;
}

export function isValid(board: Grid): boolean {
  for (let row = 0; row < 9; row++) {
    if (!hasNoDuplicates(board[row])) return false;
  }

  for (let col = 0; col < 9; col++) {
    const column: number[] = [];
    for (let row = 0; row < 9; row++) {
      column.push(board[row][col]);
    }
    if (!hasNoDuplicates(column)) return false;
  }

  for (let boxRow = 0; boxRow < 9; boxRow += 3) {
    for (let boxCol = 0; boxCol < 9; boxCol += 3) {
      const box: number[] = [];
      for (let r = boxRow; r < boxRow + 3; r++) {
        for (let c = boxCol; c < boxCol + 3; c++) {
          box.push(board[r][c]);
        }
      }
      if (!hasNoDuplicates(box)) return false;
    }
  }

  return true;
}
