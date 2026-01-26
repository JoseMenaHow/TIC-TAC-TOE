import { CellValue, BotDifficulty, Player } from "../types/game";

/**
 * Get the bot's next move based on the current board state and difficulty.
 * Returns the index of the cell to play, or null if no valid move exists.
 */
export function getBotMove(
  board: CellValue[],
  difficulty: BotDifficulty,
  gridSize: number,
  winLength: number
): number | null {
  // Get all empty cells
  const emptyCells: number[] = [];
  for (let i = 0; i < board.length; i++) {
    if (board[i] === null) {
      emptyCells.push(i);
    }
  }

  // No valid moves
  if (emptyCells.length === 0) {
    return null;
  }

  // EASY: Random empty cell
  if (difficulty === "easy") {
    const randomIndex = Math.floor(Math.random() * emptyCells.length);
    return emptyCells[randomIndex];
  }

  // NORMAL & HARD: Strategic heuristics
  const botPlayer: Player = "O";
  const humanPlayer: Player = "X";

  // 1. Try to win
  const winningMove = findWinningMove(board, botPlayer, gridSize, winLength);
  if (winningMove !== null) {
    return winningMove;
  }

  // 2. Block opponent's winning move
  const blockingMove = findWinningMove(board, humanPlayer, gridSize, winLength);
  if (blockingMove !== null) {
    return blockingMove;
  }

  // 3. HARD ONLY: Anti-fork defense (3x3 only)
  // If bot has center and human has opposite corners, play an edge to prevent fork
  if (difficulty === "hard" && gridSize === 3) {
    if (board[4] === botPlayer) {
      const hasOppositeCorners =
        (board[0] === humanPlayer && board[8] === humanPlayer) ||
        (board[2] === humanPlayer && board[6] === humanPlayer);

      if (hasOppositeCorners) {
        const edges = [1, 3, 5, 7];
        const availableEdge = edges.find(i => board[i] === null);
        if (availableEdge !== undefined) {
          return availableEdge;
        }
      }
    }
  }

  // 4. Prefer center (only for 3x3 grid)
  if (gridSize === 3) {
    const center = 4;
    if (board[center] === null) {
      return center;
    }
  }

  // 5. Prefer corners (only for 3x3 grid)
  if (gridSize === 3) {
    const corners = [0, 2, 6, 8];
    const availableCorners = corners.filter(i => board[i] === null);
    if (availableCorners.length > 0) {
      const randomIndex = Math.floor(Math.random() * availableCorners.length);
      return availableCorners[randomIndex];
    }
  }

  // 6. Fallback to random empty cell
  const randomIndex = Math.floor(Math.random() * emptyCells.length);
  return emptyCells[randomIndex];
}

/**
 * Find a move that would result in a win for the given player.
 * Returns the cell index or null if no winning move exists.
 */
function findWinningMove(
  board: CellValue[],
  player: Player,
  gridSize: number,
  winLength: number
): number | null {
  // Try each empty cell and see if it results in a win
  for (let i = 0; i < board.length; i++) {
    if (board[i] === null) {
      // Simulate the move
      const testBoard = [...board];
      testBoard[i] = player;

      // Check if this creates a winning line
      if (checkWinForPlayer(testBoard, player, gridSize, winLength)) {
        return i;
      }
    }
  }

  return null;
}

/**
 * Check if the given player has won on the board.
 * Simplified version of checkWinner that only checks for a specific player.
 */
function checkWinForPlayer(
  board: CellValue[],
  player: Player,
  gridSize: number,
  winLength: number
): boolean {
  // Check rows
  for (let row = 0; row < gridSize; row++) {
    for (let col = 0; col <= gridSize - winLength; col++) {
      let count = 0;
      for (let k = 0; k < winLength; k++) {
        const index = row * gridSize + col + k;
        if (board[index] === player) {
          count++;
        }
      }
      if (count === winLength) return true;
    }
  }

  // Check columns
  for (let col = 0; col < gridSize; col++) {
    for (let row = 0; row <= gridSize - winLength; row++) {
      let count = 0;
      for (let k = 0; k < winLength; k++) {
        const index = (row + k) * gridSize + col;
        if (board[index] === player) {
          count++;
        }
      }
      if (count === winLength) return true;
    }
  }

  // Check diagonals (top-left to bottom-right)
  for (let row = 0; row <= gridSize - winLength; row++) {
    for (let col = 0; col <= gridSize - winLength; col++) {
      let count = 0;
      for (let k = 0; k < winLength; k++) {
        const index = (row + k) * gridSize + (col + k);
        if (board[index] === player) {
          count++;
        }
      }
      if (count === winLength) return true;
    }
  }

  // Check diagonals (top-right to bottom-left)
  for (let row = 0; row <= gridSize - winLength; row++) {
    for (let col = winLength - 1; col < gridSize; col++) {
      let count = 0;
      for (let k = 0; k < winLength; k++) {
        const index = (row + k) * gridSize + (col - k);
        if (board[index] === player) {
          count++;
        }
      }
      if (count === winLength) return true;
    }
  }

  return false;
}
