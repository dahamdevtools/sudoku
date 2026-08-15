import { createPuzzle } from "@/lib/sudoku/createPuzzle";
import { isComplete } from "@/lib/sudoku/isComplete";
import { isCorrect } from "@/lib/sudoku/isCorrect";
import { Grid } from "@/types/sudoku";
import { useEffect, useState } from "react";

const EMPTY_GRID = (): Grid =>
  Array.from({ length: 9 }, () => Array(9).fill(0));

function formatTime(totalSeconds: number): string {
  const h = Math.floor(totalSeconds / 3600);
  const m = Math.floor((totalSeconds % 3600) / 60);
  const s = totalSeconds % 60;

  const pad = (n: number) => (n < 10 ? "0" + n : String(n));
  return `${pad(h)}:${pad(m)}:${pad(s)}`;
}

export function useSudokuGame() {
  const [puzzle, setPuzzle] = useState<Grid>(EMPTY_GRID());

  const [trackingPuzzle, setTrackingPuzzle] = useState<Grid>(EMPTY_GRID());

  const [drawPuzzle, setDrawPuzzle] = useState<Grid>(EMPTY_GRID());

  const [solution, setSolution] = useState<Grid>(EMPTY_GRID());

  const [valueRecorder, setValueRecorder] = useState<
    { value: number; count: number }[]
  >(Array.from({ length: 9 }, (_, index) => ({ value: index + 1, count: 9 })));

  const [coordinates, setCoordinates] = useState<number[]>([]);

  const [error, setError] = useState<{ status: boolean; count: number }>({
    status: false,
    count: 0,
  });

  const [newPuzzleTrigger, setNewPuzzleTrigger] = useState(false);

  const [newGameModal, setNewGameModal] = useState({
    isVisible: false,
    isWin: false,
  });

  const [drawMode, setDrawMode] = useState(false);

  const [elapsedSeconds, setElapsedSeconds] = useState(0);

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
    setDrawPuzzle(EMPTY_GRID());

    setElapsedSeconds(0);

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

  function setValue(value: number) {
    if (coordinates.length === 0) return;

    const [row, col] = coordinates;

    if (drawMode) {
      setError({ status: false, count: error.count });

      setDrawPuzzle((prevPuzzle) => {
        const newPuzzle = prevPuzzle.map((r, i) => (row === i ? [...r] : r));
        newPuzzle[row][col] = value;
        return newPuzzle;
      });

      return;
    }

    const alreadyLocked =
      puzzle[row][col] !== 0 && puzzle[row][col] === trackingPuzzle[row][col];
    if (alreadyLocked) return;

    setDrawPuzzle((prevPuzzle) => {
      const newPuzzle = prevPuzzle.map((r, i) => (row === i ? [...r] : r));
      newPuzzle[row][col] = 0;
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

    if (drawPuzzle[row][col] !== 0) {
      setDrawPuzzle((prevPuzzle) => {
        const newPuzzle = prevPuzzle.map((r, i) => (row === i ? [...r] : r));
        newPuzzle[row][col] = 0;
        return newPuzzle;
      });
    }

    if (puzzle[row][col] !== 0) {
      setPuzzle((prevPuzzle) => {
        const newPuzzle = prevPuzzle.map((r, i) => (row === i ? [...r] : r));
        newPuzzle[row][col] = 0;
        return newPuzzle;
      });
    }
  }

  function startNewGame() {
    setError({ status: false, count: 0 });
    setNewGameModal({ isVisible: false, isWin: false });
    generateNewPuzzle();
    setNewPuzzleTrigger((prev) => !prev);
  }

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
  };
}
