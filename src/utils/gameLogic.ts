import { CellValue, Player } from "../types/game";

/**
 * Check if there's a winner on the board.
 * Returns the winning player and the indices of the winning line, or null if no winner.
 */
export function checkWinner(
  board: CellValue[],
  gridSize: number,
  winLength: number
): { winner: Player; line: number[] } | null {
  // Helper to check if a line has a winner
  const checkLine = (indices: number[]): { winner: Player; line: number[] } | null => {
    if (indices.length < winLength) return null;

    for (let i = 0; i <= indices.length - winLength; i++) {
      const segment = indices.slice(i, i + winLength);
      const firstCell = board[segment[0]];

      if (firstCell && segment.every(idx => board[idx] === firstCell)) {
        return { winner: firstCell, line: segment };
      }
    }
    return null;
  };

  // Check rows
  for (let row = 0; row < gridSize; row++) {
    const indices = [];
    for (let col = 0; col < gridSize; col++) {
      indices.push(row * gridSize + col);
    }
    const result = checkLine(indices);
    if (result) return result;
  }

  // Check columns
  for (let col = 0; col < gridSize; col++) {
    const indices = [];
    for (let row = 0; row < gridSize; row++) {
      indices.push(row * gridSize + col);
    }
    const result = checkLine(indices);
    if (result) return result;
  }

  // Check diagonals (top-left to bottom-right)
  for (let startRow = 0; startRow < gridSize; startRow++) {
    const indices = [];
    let row = startRow;
    let col = 0;
    while (row < gridSize && col < gridSize) {
      indices.push(row * gridSize + col);
      row++;
      col++;
    }
    const result = checkLine(indices);
    if (result) return result;
  }
  for (let startCol = 1; startCol < gridSize; startCol++) {
    const indices = [];
    let row = 0;
    let col = startCol;
    while (row < gridSize && col < gridSize) {
      indices.push(row * gridSize + col);
      row++;
      col++;
    }
    const result = checkLine(indices);
    if (result) return result;
  }

  // Check diagonals (top-right to bottom-left)
  for (let startRow = 0; startRow < gridSize; startRow++) {
    const indices = [];
    let row = startRow;
    let col = gridSize - 1;
    while (row < gridSize && col >= 0) {
      indices.push(row * gridSize + col);
      row++;
      col--;
    }
    const result = checkLine(indices);
    if (result) return result;
  }
  for (let startCol = gridSize - 2; startCol >= 0; startCol--) {
    const indices = [];
    let row = 0;
    let col = startCol;
    while (row < gridSize && col >= 0) {
      indices.push(row * gridSize + col);
      row++;
      col--;
    }
    const result = checkLine(indices);
    if (result) return result;
  }

  return null;
}

/**
 * Check if the game is a draw (board is full and no winner).
 */
export function checkDraw(board: CellValue[]): boolean {
  return board.every(cell => cell !== null);
}
