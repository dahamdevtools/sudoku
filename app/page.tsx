"use client";

import { useSudokuGame } from "@/hooks/useSudokuGame";
import { LuEraser, LuLightbulb, LuPencil, LuUndo2 } from "react-icons/lu";

export default function Home() {
  const {
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
    time,
    hint,
    hintsUsed,
    undo,
    canUndo,
    score,
  } = useSudokuGame();

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
                    const realValue = puzzle[rowIndex][colIndex];
                    const drawValue = drawPuzzle[rowIndex][colIndex];
                    const isSelected =
                      coordinates[0] === rowIndex &&
                      coordinates[1] === colIndex;
                    const isWrong =
                      trackingPuzzle[rowIndex][colIndex] !==
                      puzzle[rowIndex][colIndex];
                    const isDraw = drawValue !== 0;

                    return (
                      <button
                        key={`[${rowIndex}, ${colIndex}]`}
                        onClick={() => selectCell(rowIndex, colIndex)}
                        disabled={newGameModal.isVisible}
                        className={`
                          ${isSelected ? "bg-mauve-700/70" : ""}
                          ${!isSelected && rowIndex === coordinates[0] ? "bg-mauve-800/50" : ""}
                          ${!isSelected && colIndex === coordinates[1] ? "bg-mauve-800/50" : ""}
                          ${!isSelected && Math.floor(coordinates[0] / 3) === boxRow && Math.floor(coordinates[1] / 3) === boxCol ? "bg-mauve-800/50" : ""}
                          ${isSelected && !isDraw && isWrong ? "bg-rose-500/40 text-rose-500" : ""}
                          ${!isDraw && isWrong ? "bg-rose-500/20 text-rose-500" : ""}
                          ${row === 0 ? "border-t-0" : "border-t"}
                          ${row === 2 ? "border-b-0" : "border-b"}
                          ${col === 0 ? "border-l-0" : "border-l"}
                          ${col === 2 ? "border-r-0" : "border-r"}
                          ${isDraw ? "p-2 text-mauve-500" : "items-center justify-center text-2xl"}
                          w-full flex aspect-square cursor-pointer disabled:cursor-default border-mauve-700/40`}
                      >
                        {realValue !== 0
                          ? realValue
                          : drawValue !== 0
                            ? drawValue
                            : ""}
                      </button>
                    );
                  }),
                )}
              </div>
            )),
          )}
        </div>

        <div className="w-64 h-fit flex flex-col gap-4">
          <p
            style={{ fontFamily: "var(--font-jetbrains-mono)" }}
            className="text-2xl text-mauve-500"
          >
            {time}
          </p>
          <div className="w-full h-fit grid grid-cols-4 items-center gap-2 text-2xl">
            <button
              onClick={toggleDrawMode}
              className={`w-full cursor-pointer aspect-square rounded-full flex items-center justify-center ${drawMode ? "text-mauve-300 bg-mauve-800" : "text-mauve-500 bg-mauve-900"}`}
            >
              <LuPencil />
            </button>
            <button
              onClick={erase}
              className="w-full cursor-pointer aspect-square rounded-full flex items-center justify-center text-mauve-500 bg-mauve-900 active:text-mauve-300 active:bg-mauve-800"
            >
              <LuEraser />
            </button>
            <button
              onClick={undo}
              disabled={!canUndo}
              className="disabled:opacity-30 w-full cursor-pointer disabled:cursor-default aspect-square rounded-full flex items-center justify-center text-mauve-500 bg-mauve-900 active:text-mauve-300 active:bg-mauve-800"
            >
              <LuUndo2 />
            </button>
            <button
              onClick={hint}
              className="w-full cursor-pointer aspect-square rounded-full flex items-center justify-center text-mauve-500 bg-mauve-900 active:text-mauve-300 active:bg-mauve-800"
            >
              <LuLightbulb />
            </button>
          </div>
          <div className="w-fit h-fit flex flex-col gap-1 text-mauve-500">
            <div className="w-fit h-fit flex items-center gap-2">
              <p>Mistakes</p>
              <p>:</p>
              <p>{error.count}/3</p>
            </div>
            <div className="w-fit h-fit flex items-center gap-2">
              <p>Hints</p>
              <p>:</p>
              <p>{hintsUsed}</p>
            </div>
            <div className="w-fit h-fit flex items-center gap-2">
              <p>Score</p>
              <p>:</p>
              <p>{score}</p>
            </div>
          </div>
          <div className="w-full h-64 aspect-square grid grid-cols-3 gap-1">
            {valueRecorder.map((data, index) => (
              <button
                key={index}
                onClick={() => setValue(data.value)}
                disabled={data.count === 0}
                className={`disabled:bg-mauve-900/20 w-full min-h-0 cursor-pointer aspect-square flex flex-col items-center justify-center rounded-lg relative bg-mauve-900`}
              >
                <span className="w-full h-full flex items-center justify-center text-3xl text-mauve-300">
                  {data.count === 0 ? "✓" : data.value}
                </span>
                <span className="absolute bottom-0 right-0 leading-none p-2 flex items-center justify-center text-mauve-600">
                  {valueRecorder.find((item) => item.value === data.value)
                    ?.count === 0
                    ? ""
                    : valueRecorder.find((item) => item.value === data.value)
                        ?.count}
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {newGameModal.isVisible && (
        <div className="w-screen h-screen fixed top-0 left-0 z-10 flex items-center justify-center backdrop-blur-xl bg-mauve-950/50">
          <div className="w-xs h-fit p-5 rounded-xl flex flex-col items-center gap-5 bg-mauve-900">
            <p className="text-2xl text-center text-mauve-300">
              {newGameModal.isWin ? "Congratulation" : "Game Over"}
            </p>
            <p className="text-center text-mauve-500">
              {newGameModal.isWin
                ? "You have completed the puzzle and won the game"
                : "You have made 3 mistakes and lost this game"}
            </p>
            <button
              onClick={startNewGame}
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
