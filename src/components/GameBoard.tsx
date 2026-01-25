import { CellValue } from "../types/game";
import Cell from "./Cell";

interface GameBoardProps {
  board: CellValue[];
  gridSize: number;
  winningLine: number[] | null;
  onCellClick: (index: number) => void;
  lastMoveIndex: number | null;
}

export default function GameBoard({ board, gridSize, winningLine, onCellClick, lastMoveIndex }: GameBoardProps) {
  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: `repeat(${gridSize}, 1fr)`,
        gap: "8px",
        width: "100%",
        maxWidth: "400px",
        padding: "0 var(--spacing-unit)",
      }}
    >
      {board.map((cell, index) => (
        <Cell
          key={index}
          value={cell}
          onClick={() => onCellClick(index)}
          isWinningCell={winningLine?.includes(index) || false}
          isLastMove={index === lastMoveIndex}
        />
      ))}
    </div>
  );
}
