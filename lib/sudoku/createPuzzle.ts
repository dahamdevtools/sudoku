import { Grid } from "@/types/sudoku";
import { generate } from "./generate";
import { removeCells } from "./removeCells";

export function createPuzzle(emptySlots: number): {
  puzzle: Grid;
  solution: Grid;
} {
  const emptyGrid: Grid = Array.from({ length: 9 }, () => Array(9).fill(0));
  generate(emptyGrid);
  const solution = emptyGrid;

  const puzzleGrid = structuredClone(solution);
  removeCells(puzzleGrid, emptySlots);
  const puzzle = puzzleGrid;

  return { puzzle, solution };
}
