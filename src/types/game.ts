// Game configuration
export type GameMode = "local" | "bot" | "online";
export type BotDifficulty = "easy" | "normal" | "hard";
export type Ruleset = "classic" | "decay";

export interface GameConfig {
  mode: GameMode;
  gridSize: number;
  winLength: number;
  difficulty?: BotDifficulty;
  ruleset?: Ruleset;
  decayTurns?: number;
}

// Game state
export type Player = "X" | "O";
export type CellValue = Player | null;

export interface Placement {
  index: number;
  value: Player;
  placedTurn: number;
}

export interface GameState {
  board: CellValue[];
  currentPlayer: Player;
  turnNumber: number;
  winner: Player | null;
  winningLine: number[] | null;
  isDraw: boolean;
  placements: Placement[];
  expiringIndices: number[]; // Indices of cells currently expiring
}
