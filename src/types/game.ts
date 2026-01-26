// Game configuration
export type GameMode = "local" | "bot" | "online";
export type BotDifficulty = "easy" | "normal" | "hard";

export interface GameConfig {
  mode: GameMode;
  gridSize: number;
  winLength: number;
  difficulty?: BotDifficulty;
}

// Game state
export type Player = "X" | "O";
export type CellValue = Player | null;

export interface GameState {
  board: CellValue[];
  currentPlayer: Player;
  turnNumber: number;
  winner: Player | null;
  winningLine: number[] | null;
  isDraw: boolean;
}
