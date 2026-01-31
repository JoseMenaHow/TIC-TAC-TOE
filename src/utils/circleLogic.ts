import { Circle, CircleSize, CircleInventory, CellStacks, Player, CellValue } from "../types/game";

/**
 * Initialize starting inventory for a player
 */
export function initializeCircleInventory(): CircleInventory {
  return {
    small: 2,
    medium: 2,
    large: 2,
  };
}

/**
 * Get the size key from CircleSize number
 */
export function getSizeKey(size: CircleSize): keyof CircleInventory {
  if (size === 1) return "small";
  if (size === 2) return "medium";
  return "large";
}

/**
 * Check if a circle placement is valid
 * Returns true if:
 * - Cell is empty, OR
 * - Cell's top circle is smaller than the new circle size
 */
export function isValidCirclePlacement(
  cellStacks: CellStacks,
  cellIndex: number,
  newSize: CircleSize
): boolean {
  const stack = cellStacks[cellIndex];

  // Empty cell - always valid
  if (stack.length === 0) {
    return true;
  }

  // Occupied - only valid if new size is strictly larger than top circle
  const topCircle = stack[stack.length - 1];
  return newSize > topCircle.size;
}

/**
 * Place a circle on the board
 * Returns:
 * - new cell stacks with placement
 * - updated inventory
 * - captured circle (if any)
 */
export function placeCircle(
  cellStacks: CellStacks,
  inventory: CircleInventory,
  cellIndex: number,
  size: CircleSize,
  player: Player
): {
  newStacks: CellStacks;
  newInventory: CircleInventory;
  capturedCircle: Circle | null;
} {
  // Validate placement
  if (!isValidCirclePlacement(cellStacks, cellIndex, size)) {
    throw new Error("Invalid circle placement");
  }

  // Check inventory
  const sizeKey = getSizeKey(size);
  if (inventory[sizeKey] <= 0) {
    throw new Error(`No ${sizeKey} circles remaining`);
  }

  // Clone stacks
  const newStacks = cellStacks.map(stack => [...stack]);

  // Capture top circle if present
  let capturedCircle: Circle | null = null;
  if (newStacks[cellIndex].length > 0) {
    capturedCircle = newStacks[cellIndex].pop()!;
  }

  // Create unique ID for new circle
  const circleId = `${player}-${size}-${crypto.randomUUID()}`;

  // Place new circle
  const newCircle: Circle = {
    id: circleId,
    owner: player,
    size,
  };
  newStacks[cellIndex].push(newCircle);

  // Update inventory
  const newInventory = { ...inventory };
  newInventory[sizeKey]--;

  return {
    newStacks,
    newInventory,
    capturedCircle,
  };
}

/**
 * Project cell stacks to a CellValue[] board based on top circles
 * This allows reusing existing win detection logic
 */
export function getTopOwnerBoard(cellStacks: CellStacks): CellValue[] {
  return cellStacks.map(stack => {
    if (stack.length === 0) return null;
    const topCircle = stack[stack.length - 1];
    return topCircle.owner;
  });
}

/**
 * Check if a player has any valid moves remaining
 */
export function hasValidMoves(
  cellStacks: CellStacks,
  inventory: CircleInventory
): boolean {
  // Check each size in inventory
  const sizes: CircleSize[] = [1, 2, 3];

  for (const size of sizes) {
    const sizeKey = getSizeKey(size);
    if (inventory[sizeKey] <= 0) continue;

    // Check if this size can be placed anywhere
    for (let i = 0; i < cellStacks.length; i++) {
      if (isValidCirclePlacement(cellStacks, i, size)) {
        return true;
      }
    }
  }

  return false;
}

/**
 * Check if the game is a draw for circles ruleset
 * Draw occurs when both players have no valid moves
 */
export function checkCirclesDraw(
  cellStacks: CellStacks,
  inventoryX: CircleInventory,
  inventoryO: CircleInventory
): boolean {
  return (
    !hasValidMoves(cellStacks, inventoryX) &&
    !hasValidMoves(cellStacks, inventoryO)
  );
}

/**
 * Get the next available size from a player's inventory
 * Used for auto-selection when current size becomes invalid
 * Returns null if no sizes available
 */
export function getNextAvailableSize(inventory: CircleInventory): CircleSize | null {
  if (inventory.small > 0) return 1;
  if (inventory.medium > 0) return 2;
  if (inventory.large > 0) return 3;
  return null;
}

/**
 * Circle move type for bot AI
 */
export type CircleMove = { cellIndex: number; size: 1 | 2 | 3 };

/**
 * Helper: get count for a specific size from inventory
 */
function invForSize(inv: CircleInventory, size: 1 | 2 | 3): number {
  return size === 1 ? inv.small : size === 2 ? inv.medium : inv.large;
}

/**
 * Helper: decrement inventory for a specific size
 */
function decInv(inv: CircleInventory, size: 1 | 2 | 3): CircleInventory {
  if (size === 1) return { ...inv, small: inv.small - 1 };
  if (size === 2) return { ...inv, medium: inv.medium - 1 };
  return { ...inv, large: inv.large - 1 };
}

/**
 * Get all valid circle moves for a given inventory and board state
 * Used by bot AI to select a move
 */
export function getValidCircleMoves(
  cellStacks: CellStacks,
  inventory: CircleInventory
): CircleMove[] {
  const moves: CircleMove[] = [];
  const sizes: (1 | 2 | 3)[] = [1, 2, 3];

  for (const size of sizes) {
    if (invForSize(inventory, size) <= 0) continue;

    for (let cellIndex = 0; cellIndex < cellStacks.length; cellIndex++) {
      if (isValidCirclePlacement(cellStacks, cellIndex, size)) {
        moves.push({ cellIndex, size });
      }
    }
  }

  return moves;
}

/**
 * Simulate placing a circle WITHOUT mutating inputs.
 * Returns newStacks, newInventory, capturedSize (0 if no capture)
 */
export function simulateCircleMove(
  cellStacks: CellStacks,
  inventory: CircleInventory,
  move: CircleMove,
  player: Player
): {
  newStacks: CellStacks;
  newInventory: CircleInventory;
  capturedSize: 0 | 1 | 2 | 3;
} {
  const { cellIndex, size } = move;

  if (invForSize(inventory, size) <= 0) {
    throw new Error("simulateCircleMove: no inventory");
  }
  if (!isValidCirclePlacement(cellStacks, cellIndex, size)) {
    throw new Error("simulateCircleMove: invalid placement");
  }

  const newStacks = cellStacks.map(s => [...s]);
  let capturedSize: 0 | 1 | 2 | 3 = 0;

  if (newStacks[cellIndex].length > 0) {
    const top = newStacks[cellIndex][newStacks[cellIndex].length - 1];
    capturedSize = top.size;
    newStacks[cellIndex].pop();
  }

  newStacks[cellIndex].push({
    // deterministic id is fine for simulation (memoization ignores ids)
    id: `sim-${player}-${size}-${cellIndex}-${inventory.small}${inventory.medium}${inventory.large}`,
    owner: player,
    size,
  });

  const newInventory = decInv(inventory, size);

  return { newStacks, newInventory, capturedSize };
}

/**
 * Get the top circle from a cell stack, or null if empty
 */
export function getTopCircle(cellStacks: CellStacks, cellIndex: number): Circle | null {
  const stack = cellStacks[cellIndex];
  if (!stack || stack.length === 0) return null;
  return stack[stack.length - 1];
}

/**
 * Light heuristic scoring for a circles move.
 * Higher = better for current player.
 */
export function scoreCircleMoveHeuristic(args: {
  move: CircleMove;
  capturedSize: 0 | 1 | 2 | 3;
  projectedBoard: CellValue[];
  gridSize: number;
  topCircleOwner: Player | null;
  topCircleSize: 0 | 1 | 2 | 3;
  currentPlayer: Player;
}): number {
  const { move, capturedSize, projectedBoard, gridSize, topCircleOwner, topCircleSize, currentPlayer } = args;

  // Positional weights for 3x3 (fallback neutral for other sizes)
  const is3x3 = gridSize === 3;
  const center = is3x3 ? 4 : -1;
  const corners = is3x3 ? new Set([0, 2, 6, 8]) : new Set<number>();

  let score = 0;

  // Prefer capturing larger pieces
  score += capturedSize * 6; // capture 3 > 2 > 1

  // Prefer using smaller size when possible (save big pieces)
  score += (4 - move.size) * 2;

  // Prefer center then corners in 3x3
  if (is3x3 && move.cellIndex === center) score += 4;
  if (is3x3 && corners.has(move.cellIndex)) score += 2;

  // Prefer creating more controlled cells (tiny nudge)
  const ownedCount = projectedBoard.filter(v => v !== null).length;
  score += ownedCount * 0.2;

  // Big penalty for covering your own piece in non-critical situations
  // (Win/block logic is handled before scoring, so this is safe)
  if (topCircleOwner === currentPlayer && topCircleSize > 0) {
    const jump = move.size - topCircleSize; // always >= 1 if valid
    // Strong penalty to stop wasting big circles
    const wastePenalty = (move.size * 10) + (jump * 8);
    score -= wastePenalty;
  }

  return score;
}
