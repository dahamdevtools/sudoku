import { createPuzzle } from "@/lib/sudoku/createPuzzle";
import { isComplete } from "@/lib/sudoku/isComplete";
import { isCorrect } from "@/lib/sudoku/isCorrect";
import { isSafe } from "@/lib/sudoku/isSafe";
import { Grid } from "@/types/sudoku";
import { useEffect, useState } from "react";

const EMPTY_GRID = (): Grid =>
  Array.from({ length: 9 }, () => Array(9).fill(0));

type Marks = boolean[][][];

const EMPTY_MARKS = (): Marks =>
  Array.from({ length: 9 }, () =>
    Array.from({ length: 9 }, () => Array(9).fill(false)),
  );

function formatTime(totalSeconds: number): string {
  const h = Math.floor(totalSeconds / 3600);
  const m = Math.floor((totalSeconds % 3600) / 60);
  const s = totalSeconds % 60;

  const pad = (n: number) => (n < 10 ? "0" + n : String(n));
  return `${pad(h)}:${pad(m)}:${pad(s)}`;
}

function clearMarksForPlacement(
  marks: Marks,
  row: number,
  col: number,
  value: number,
): Marks {
  const next = marks.map((r) => r.map((c) => [...c]));
  const idx = value - 1;

  for (let c = 0; c < 9; c++) next[row][c][idx] = false;
  for (let r = 0; r < 9; r++) next[r][col][idx] = false;

  const boxRow = row - (row % 3);
  const boxCol = col - (col % 3);
  for (let r = boxRow; r < boxRow + 3; r++) {
    for (let c = boxCol; c < boxCol + 3; c++) {
      next[r][c][idx] = false;
    }
  }

  return next;
}

type ValueRecorder = { value: number; count: number }[];
type ModalState = { isVisible: boolean; isWin: boolean };
type ErrorState = { status: boolean; count: number };

type Snapshot = {
  puzzle: Grid;
  trackingPuzzle: Grid;
  drawPuzzle: Marks;
  valueRecorder: ValueRecorder;
  error: ErrorState;
  hintsUsed: number;
};

export function useSudokuGame() {
  const [puzzle, setPuzzle] = useState<Grid>(EMPTY_GRID());
  const [trackingPuzzle, setTrackingPuzzle] = useState<Grid>(EMPTY_GRID());
  const [drawPuzzle, setDrawPuzzle] = useState<Marks>(EMPTY_MARKS());
  const [solution, setSolution] = useState<Grid>(EMPTY_GRID());
  const [newPuzzleTrigger, setNewPuzzleTrigger] = useState(false);
  const [coordinates, setCoordinates] = useState<number[]>([]);
  const [drawMode, setDrawMode] = useState(false);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [hintsUsed, setHintsUsed] = useState(0);
  const [history, setHistory] = useState<Snapshot[]>([]);

  const [valueRecorder, setValueRecorder] = useState<ValueRecorder>(
    Array.from({ length: 9 }, (_, index) => ({ value: index + 1, count: 9 })),
  );

  const [error, setError] = useState<ErrorState>({
    status: false,
    count: 0,
  });

  const [newGameModal, setNewGameModal] = useState<ModalState>({
    isVisible: false,
    isWin: false,
  });

  useEffect(() => {
    if (newGameModal.isVisible) return;

    const timer = setInterval(() => {
      setElapsedSeconds((prev) => prev + 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [newPuzzleTrigger, newGameModal.isVisible]);

  function generateNewPuzzle() {
    const result = createPuzzle(40);
    setPuzzle(result.puzzle);
    setTrackingPuzzle(result.puzzle);
    setSolution(result.solution);
    setDrawPuzzle(EMPTY_MARKS());
    setElapsedSeconds(0);
    setHintsUsed(0);
    setHistory([]);

    const counts = Array(10).fill(0);
    result.puzzle.forEach((row) => row.forEach((value) => counts[value]++));

    const newValueRecorder = Array.from({ length: 9 }, (_, index) => ({
      value: index + 1,
      count: 9 - counts[index + 1],
    }));

    setValueRecorder(newValueRecorder);
  }

  useEffect(() => {
    generateNewPuzzle();
  }, []);

  function selectCell(row: number, col: number) {
    setError({ status: false, count: error.count });
    setCoordinates([row, col]);
  }

  function toggleDrawMode() {
    setDrawMode((prev) => !prev);
  }

  function pushHistory() {
    const snapshot: Snapshot = {
      puzzle: structuredClone(puzzle),
      trackingPuzzle: structuredClone(trackingPuzzle),
      drawPuzzle: structuredClone(drawPuzzle),
      valueRecorder: structuredClone(valueRecorder),
      error: { ...error },
      hintsUsed,
    };
    setHistory((prev) => [...prev, snapshot]);
  }

  function undo() {
    if (history.length === 0) return;

    const last = history[history.length - 1];

    setPuzzle(last.puzzle);
    setTrackingPuzzle(last.trackingPuzzle);
    setDrawPuzzle(last.drawPuzzle);
    setValueRecorder(last.valueRecorder);
    setError(last.error);
    setHintsUsed(last.hintsUsed);

    setHistory((prev) => prev.slice(0, -1));
    setCoordinates([]);
  }

  function setValue(value: number) {
    if (coordinates.length === 0) return;

    const [row, col] = coordinates;

    if (drawMode) {
      const alreadyMarked = drawPuzzle[row][col][value - 1];

      if (!alreadyMarked && !isSafe(puzzle, row, col, value)) return;

      setError({ status: false, count: error.count });

      setDrawPuzzle((prevPuzzle) => {
        const newPuzzle = prevPuzzle.map((r, i) =>
          row === i ? r.map((c) => [...c]) : r,
        );
        newPuzzle[row][col][value - 1] = !alreadyMarked;
        return newPuzzle;
      });

      return;
    }

    const alreadyLocked =
      puzzle[row][col] !== 0 && puzzle[row][col] === trackingPuzzle[row][col];
    if (alreadyLocked) return;

    pushHistory();

    setDrawPuzzle((prevPuzzle) => {
      const newPuzzle = prevPuzzle.map((r, i) =>
        row === i ? r.map((c) => [...c]) : r,
      );
      newPuzzle[row][col] = Array(9).fill(false);
      return newPuzzle;
    });

    const puzzleCopy = structuredClone(trackingPuzzle);
    puzzleCopy[row][col] = value;

    if (isCorrect(puzzleCopy, solution)) {
      setValueRecorder((prevValueRecorder) => {
        const newValueRecorder = prevValueRecorder.map((obj) =>
          obj.value === value ? { ...obj, count: obj.count - 1 } : obj,
        );
        return newValueRecorder;
      });

      setTrackingPuzzle((prevPuzzle) => {
        const newPuzzle = prevPuzzle.map((r, i) => (row === i ? [...r] : r));
        newPuzzle[row][col] = value;
        return newPuzzle;
      });

      setPuzzle((prevPuzzle) => {
        const newPuzzle = prevPuzzle.map((r, i) => (row === i ? [...r] : r));
        newPuzzle[row][col] = value;
        return newPuzzle;
      });

      setDrawPuzzle((prev) => clearMarksForPlacement(prev, row, col, value));

      setCoordinates([]);

      if (isComplete(puzzleCopy)) {
        setNewGameModal({ isVisible: true, isWin: true });
      }
    } else {
      setPuzzle((prevPuzzle) => {
        const newPuzzle = prevPuzzle.map((r, i) => (row === i ? [...r] : r));
        newPuzzle[row][col] = value;
        return newPuzzle;
      });

      const newErrorCount = error.count + 1;
      setError({ status: true, count: newErrorCount });

      if (newErrorCount >= 3) {
        setCoordinates([]);
        setNewGameModal({ isVisible: true, isWin: false });
      }
    }
  }

  function erase() {
    if (coordinates.length === 0) return;

    const [row, col] = coordinates;

    const alreadyLocked =
      puzzle[row][col] !== 0 && puzzle[row][col] === trackingPuzzle[row][col];
    if (alreadyLocked) return;

    setDrawPuzzle((prevPuzzle) => {
      const newPuzzle = prevPuzzle.map((r, i) =>
        row === i ? r.map((c) => [...c]) : r,
      );
      newPuzzle[row][col] = Array(9).fill(false);
      return newPuzzle;
    });

    if (puzzle[row][col] !== 0) {
      setPuzzle((prevPuzzle) => {
        const newPuzzle = prevPuzzle.map((r, i) => (row === i ? [...r] : r));
        newPuzzle[row][col] = 0;
        return newPuzzle;
      });
    }
  }

  function hint() {
    let row: number;
    let col: number;

    if (coordinates.length === 2) {
      [row, col] = coordinates;
      if (puzzle[row][col] !== 0) return;
    } else {
      const emptyCells: [number, number][] = [];

      for (let r = 0; r < 9; r++) {
        for (let c = 0; c < 9; c++) {
          if (puzzle[r][c] === 0) {
            emptyCells.push([r, c]);
          }
        }
      }

      if (emptyCells.length === 0) return;

      [row, col] = emptyCells[Math.floor(Math.random() * emptyCells.length)];
    }

    pushHistory();

    const value = solution[row][col];

    setValueRecorder((prev) =>
      prev.map((obj) =>
        obj.value === value ? { ...obj, count: obj.count - 1 } : obj,
      ),
    );

    setTrackingPuzzle((prev) => {
      const next = prev.map((r, i) => (row === i ? [...r] : r));
      next[row][col] = value;
      return next;
    });

    setPuzzle((prev) => {
      const next = prev.map((r, i) => (row === i ? [...r] : r));
      next[row][col] = value;
      return next;
    });

    setDrawPuzzle((prevPuzzle) => {
      const newPuzzle = prevPuzzle.map((r, i) =>
        row === i ? r.map((c) => [...c]) : r,
      );
      newPuzzle[row][col] = Array(9).fill(false);
      return newPuzzle;
    });

    setHintsUsed((prev) => prev + 1);
    setCoordinates([]);

    const checkGrid = structuredClone(trackingPuzzle);
    checkGrid[row][col] = value;

    if (isComplete(checkGrid)) {
      setNewGameModal({ isVisible: true, isWin: true });
    }
  }

  function startNewGame() {
    setError({ status: false, count: 0 });
    setNewGameModal({ isVisible: false, isWin: false });
    generateNewPuzzle();
    setNewPuzzleTrigger((prev) => !prev);
  }

  const score = Math.max(0, 1000 - error.count * 50 - hintsUsed * 100);

  return {
    puzzle,
    trackingPuzzle,
    drawPuzzle,
    selectCell,
    newGameModal,
    toggleDrawMode,
    erase,
    setValue,
    startNewGame,
    valueRecorder,
    error,
    coordinates,
    drawMode,
    time: formatTime(elapsedSeconds),
    hint,
    hintsUsed,
    undo,
    canUndo: history.length > 0,
    score,
  };
}
