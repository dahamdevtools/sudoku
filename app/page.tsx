"use client";

import { createPuzzle } from "@/lib/sudoku/createPuzzle";
import { isCorrect } from "@/lib/sudoku/isCorrect";
import { Grid } from "@/types/sudoku";
import { useEffect, useState } from "react";
import { LuEraser, LuPencil } from "react-icons/lu";

export default function Home() {
  const [puzzle, setPuzzle] = useState<Grid>(
    Array.from({ length: 9 }, () => Array(9).fill(0)),
  );

  const [trackingPuzzle, setTrackingPuzzle] = useState<Grid>(
    Array.from({ length: 9 }, () => Array(9).fill(0)),
  );

  const [drawPuzzle, setDrawPuzzle] = useState<Grid>(
    Array.from({ length: 9 }, () => Array(9).fill(0)),
  );

  const [solution, setSolution] = useState<Grid>(
    Array.from({ length: 9 }, () => Array(9).fill(0)),
  );

  const [valueRecorder, setValueRecorder] = useState<
    { value: number; count: number }[]
  >(Array.from({ length: 9 }, (_, index) => ({ value: index + 1, count: 9 })));

  const [coordinates, setCoordinates] = useState<number[]>([]);
  const [error, setError] = useState<{ status: boolean; count: number }>({
    status: false,
    count: 0,
  });
  const [newPuzzle, setNewPuzzle] = useState(false);
  const [newGameModal, setNewGameModal] = useState(false);
  const [drawMode, setDrawMode] = useState(false);

  useEffect(() => {
    const result = createPuzzle(40);
    setPuzzle(result.puzzle);
    setTrackingPuzzle(result.puzzle);
    setSolution(structuredClone(result.solution));

    const counts = Array(10).fill(0);

    result.puzzle.forEach((row) => row.forEach((value) => counts[value]++));

    const newRecorder = Array.from({ length: 9 }, (_, index) => ({
      value: index + 1,
      count: 9 - counts[index + 1],
    }));

    setValueRecorder(newRecorder);

    console.log(result.puzzle);
    console.log(newRecorder);
  }, [newPuzzle]);

  function setValue(value: number) {
    if (coordinates.length === 0) return;

    if (drawMode) {
      setError({ status: false, count: error.count });
      setDrawPuzzle((prevPuzzle) => {
        const newPuzzle = prevPuzzle.map((row, rowIndex) =>
          rowIndex === coordinates[0] ? [...row] : row,
        );
        newPuzzle[coordinates[0]][coordinates[1]] = value;
        return newPuzzle;
      });
      setPuzzle((prevPuzzle) => {
        const newPuzzle = prevPuzzle.map((row, rowIndex) =>
          rowIndex === coordinates[0] ? [...row] : row,
        );
        newPuzzle[coordinates[0]][coordinates[1]] = value;
        return newPuzzle;
      });
      return;
    }

    setDrawPuzzle((prevPuzzle) => {
      const newPuzzle = prevPuzzle.map((row, rowIndex) =>
        rowIndex === coordinates[0] ? [...row] : row,
      );
      newPuzzle[coordinates[0]][coordinates[1]] = 0;
      return newPuzzle;
    });

    const [row, col] = coordinates;
    const alreadyLocked =
      puzzle[row][col] !== 0 && trackingPuzzle[row][col] === puzzle[row][col];

    if (alreadyLocked) return;

    const puzzleCopy = structuredClone(trackingPuzzle);
    puzzleCopy[coordinates[0]][coordinates[1]] = value;

    if (isCorrect(puzzleCopy, solution)) {
      setValueRecorder((prevValues) => {
        const newValues = prevValues.map((object) =>
          object.value === value
            ? { value: object.value, count: object.count - 1 }
            : object,
        );
        console.log(newValues);
        return newValues;
      });

      setTrackingPuzzle((prevPuzzle) => {
        const newPuzzle = prevPuzzle.map((row, rowIndex) =>
          rowIndex === coordinates[0] ? [...row] : row,
        );
        newPuzzle[coordinates[0]][coordinates[1]] = value;
        return newPuzzle;
      });

      setPuzzle((prevPuzzle) => {
        const newPuzzle = prevPuzzle.map((row, rowIndex) =>
          rowIndex === coordinates[0] ? [...row] : row,
        );
        newPuzzle[coordinates[0]][coordinates[1]] = value;
        return newPuzzle;
      });

      setCoordinates([]);
      setError({ status: false, count: error.count });
    } else {
      setPuzzle((prevPuzzle) => {
        const newPuzzle = prevPuzzle.map((row, rowIndex) =>
          rowIndex === coordinates[0] ? [...row] : row,
        );
        newPuzzle[coordinates[0]][coordinates[1]] = value;
        return newPuzzle;
      });
      if (value !== 0) {
        const newErrorCount = error.count + 1;
        setError({ status: true, count: newErrorCount });

        if (newErrorCount >= 3) {
          setCoordinates([]);
          setNewGameModal(true);
          return;
        }
      }
    }
  }

  function erase() {
    if (coordinates.length === 0) return;

    if (
      drawPuzzle[coordinates[0]][coordinates[1]] !== 0 &&
      drawPuzzle[coordinates[0]][coordinates[1]] ===
        puzzle[coordinates[0]][coordinates[1]]
    ) {
      setDrawPuzzle((prevPuzzle) => {
        const newPuzzle = prevPuzzle.map((row, rowIndex) =>
          rowIndex === coordinates[0] ? [...row] : row,
        );
        newPuzzle[coordinates[0]][coordinates[1]] = 0;
        return newPuzzle;
      });
      setPuzzle((prevPuzzle) => {
        const newPuzzle = prevPuzzle.map((row, rowIndex) =>
          rowIndex === coordinates[0] ? [...row] : row,
        );
        newPuzzle[coordinates[0]][coordinates[1]] = 0;
        return newPuzzle;
      });
    }
  }

  return (
    <div className="w-screen h-screen flex">
      <div className="w-fit h-fit m-auto flex gap-4 items-end justify-center p-16">
        <div className="w-xl h-xl aspect-square grid grid-cols-3 bg-mauve-900/70 text-mauve-300 border border-mauve-600">
          {Array.from({ length: 3 }, (_, boxRow) =>
            Array.from({ length: 3 }, (_, boxCol) => (
              <div
                key={`[${boxRow}, ${boxCol}]`}
                className="w-full aspect-square grid grid-cols-3 border border-mauve-600"
              >
                {Array.from({ length: 3 }, (_, row) =>
                  Array.from({ length: 3 }, (_, col) => {
                    const rowIndex = boxRow * 3 + row;
                    const colIndex = boxCol * 3 + col;
                    const cell = puzzle[rowIndex][colIndex];

                    return (
                      <button
                        key={`[${rowIndex}, ${colIndex}]`}
                        onClick={() => {
                          setError({ status: false, count: error.count });
                          setCoordinates([rowIndex, colIndex]);
                        }}
                        disabled={newGameModal ? true : false}
                        className={`
                          ${coordinates[0] !== undefined && puzzle[rowIndex][colIndex] !== 0 && puzzle[rowIndex][colIndex] === puzzle[coordinates[0]][coordinates[1]] ? "bg-mauve-700/70" : ""}
                          ${!(coordinates[0] === rowIndex && coordinates[1] === colIndex) && rowIndex === coordinates[0] ? "bg-mauve-800/50" : ""}
                          ${!(coordinates[0] === rowIndex && coordinates[1] === colIndex) && colIndex === coordinates[1] ? "bg-mauve-800/50" : ""}
                          ${!(coordinates[0] === rowIndex && coordinates[1] === colIndex) && Math.floor(coordinates[0] / 3) === boxRow && Math.floor(coordinates[1] / 3) === boxCol ? "bg-mauve-800/50" : ""}
                          ${coordinates[0] === rowIndex && coordinates[1] === colIndex ? "bg-mauve-700/70" : ""}
                          ${coordinates[0] === rowIndex && coordinates[1] === colIndex && error.status === true ? "bg-rose-500/10" : ""}
                          ${coordinates[0] === rowIndex && coordinates[1] === colIndex && drawPuzzle[rowIndex][colIndex] !== puzzle[rowIndex][colIndex] && trackingPuzzle[rowIndex][colIndex] !== puzzle[rowIndex][colIndex] ? "bg-rose-500/40 text-rose-500" : ""}
                          ${drawPuzzle[rowIndex][colIndex] !== puzzle[rowIndex][colIndex] && trackingPuzzle[rowIndex][colIndex] !== puzzle[rowIndex][colIndex] ? "bg-rose-500/20 text-rose-500" : ""}
                          ${row === 0 ? "border-t-0" : "border-t"}
                          ${row === 2 ? "border-b-0" : "border-b"}
                          ${col === 0 ? "border-l-0" : "border-l"}
                          ${col === 2 ? "border-r-0" : "border-r"}
                          ${drawPuzzle[rowIndex][colIndex] === puzzle[rowIndex][colIndex] ? "p-2 text-mauve-500" : "items-center justify-center text-2xl"}
                          w-full flex aspect-square cursor-pointer disabled:cursor-default border-mauve-700/40`}
                      >
                        {cell === 0 ? "" : cell}
                      </button>
                    );
                  }),
                )}
              </div>
            )),
          )}
        </div>
        <div className="w-64 h-fit flex flex-col gap-4">
          <div className="w-full h-fit grid grid-cols-4 items-center gap-2 text-2xl">
            <button
              onClick={() => setDrawMode(!drawMode)}
              className={`w-full cursor-pointer aspect-square rounded-full flex items-center justify-center ${drawMode ? "text-mauve-300 bg-mauve-800" : "text-mauve-500 bg-mauve-900"}`}
            >
              <LuPencil />
            </button>
            <button
              onClick={() => erase()}
              className="w-full cursor-pointer aspect-square rounded-full flex items-center justify-center text-mauve-500 bg-mauve-900 active:text-mauve-300 active:bg-mauve-800"
            >
              <LuEraser />
            </button>
          </div>
          <div className="w-fit h-fit flex items-center gap-2 text-mauve-500">
            <p>Mistakes</p>
            <p>:</p>
            <p>{error.count}/3</p>
          </div>
          <div className="w-full h-64 aspect-square grid grid-cols-3 gap-1">
            {valueRecorder.map((data, index) => (
              <button
                key={index}
                onClick={() => setValue(data.value)}
                disabled={data.count === 0 ? true : false}
                className={`disabled:bg-mauve-900/20 w-full cursor-pointer aspect-square flex items-center justify-center text-3xl rounded-lg text-mauve-300 bg-mauve-900`}
              >
                {data.count === 0 ? "✓" : data.value}
              </button>
            ))}
          </div>
        </div>
      </div>
      {newGameModal && (
        <div className="w-screen h-screen fixed top-0 left-0 z-10 flex items-center justify-center bg-mauve-950/50">
          <div className="w-xs h-fit p-5 rounded-xl flex flex-col items-center gap-5 bg-mauve-900">
            <p className="text-2xl text-center text-mauve-300">Game Over</p>
            <p className="text-center text-mauve-500">
              You have made 3 mistakes and lost this game
            </p>
            <button
              onClick={() => {
                setError({ status: false, count: 0 });
                setNewPuzzle(!newPuzzle);
                setNewGameModal(false);
              }}
              className="w-full h-12 rounded-lg cursor-pointer bg-mauve-800 text-mauve-300"
            >
              New Game
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
