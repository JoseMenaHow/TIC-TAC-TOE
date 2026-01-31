// Game configuration
export type GameMode = "local" | "bot" | "online";
export type BotDifficulty = "easy" | "normal" | "hard";
export type Ruleset = "classic" | "decay" | "circles";

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
  // Circle vs Circle state (only used when ruleset="circles")
  cellStacks: CellStacks | null;
  inventoryX: CircleInventory | null;
  inventoryO: CircleInventory | null;
  selectedSize: CircleSize | null;
}

// Circle vs Circle types
export type CircleSize = 1 | 2 | 3; // 1=small, 2=medium, 3=large

export interface Circle {
  id: string;           // Unique stable ID (e.g., "X-L-1" or "O-M-2")
  owner: Player;        // "X" or "O"
  size: CircleSize;     // 1, 2, or 3
}

export interface CircleInventory {
  small: number;   // Count of size 1 circles
  medium: number;  // Count of size 2 circles
  large: number;   // Count of size 3 circles
}

// Cell stacks: array indexed by board position, each containing a stack of circles
export type CellStacks = Circle[][];
