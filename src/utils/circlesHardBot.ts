import type { CircleInventory, CellStacks, Player } from "../types/game";
import { getValidCircleMoves, simulateCircleMove, getTopOwnerBoard } from "./circleLogic";

type CircleMove = { cellIndex: number; size: 1 | 2 | 3 };

type WinnerResult = { winner: Player; line: number[] } | null;

function invKey(inv: CircleInventory) {
  return `${inv.small}${inv.medium}${inv.large}`;
}

// Serialize stacks by top-to-bottom owner/size (small string, deterministic)
function stacksKey(stacks: CellStacks) {
  // Example per cell: "X1,O3" etc; empty = ""
  return stacks
    .map(cell => cell.map(c => `${c.owner}${c.size}`).join(""))
    .join("|");
}

function stateKey(args: {
  stacks: CellStacks;
  invX: CircleInventory;
  invO: CircleInventory;
  currentPlayer: Player;
}) {
  return `${args.currentPlayer}::${invKey(args.invX)}::${invKey(args.invO)}::${stacksKey(args.stacks)}`;
}

// Terminal evaluator: prefers faster wins, slower losses
function terminalScore(args: {
  winner: Player | null;
  plyFromRoot: number;
  maximizingPlayer: Player; // "O" for bot
}) {
  const { winner, plyFromRoot, maximizingPlayer } = args;

  if (winner === maximizingPlayer) return 1000 - plyFromRoot;
  if (winner && winner !== maximizingPlayer) return -1000 + plyFromRoot;
  return 0; // draw / no winner
}

// Heuristic evaluation for depth-limited leaf nodes
function evaluatePositionHeuristic(args: {
  stacks: CellStacks;
  invX: CircleInventory;
  invO: CircleInventory;
  maximizingPlayer: Player;
  gridSize: number;
}) {
  const { stacks, invX, invO, maximizingPlayer, gridSize } = args;

  let score = 0;

  // 1) Inventory advantage (more pieces = better)
  const botInv = maximizingPlayer === "O" ? invO : invX;
  const oppInv = maximizingPlayer === "O" ? invX : invO;
  const botTotal = botInv.small + botInv.medium + botInv.large;
  const oppTotal = oppInv.small + oppInv.medium + oppInv.large;
  score += (botTotal - oppTotal) * 10;

  // 2) Board control (count cells controlled by each player)
  const board = getTopOwnerBoard(stacks);
  let botCells = 0;
  let oppCells = 0;
  for (const owner of board) {
    if (owner === maximizingPlayer) botCells++;
    else if (owner) oppCells++;
  }
  score += (botCells - oppCells) * 15;

  // 3) Center control bonus (middle cell is strategically important)
  const centerIndex = Math.floor((gridSize * gridSize) / 2);
  if (board[centerIndex] === maximizingPlayer) score += 5;
  else if (board[centerIndex] && board[centerIndex] !== maximizingPlayer) score -= 5;

  return score;
}

/**
 * Compute best move for HARD circles bot (assumes bot is player "O")
 */
export function computeBestCirclesMoveHard(args: {
  stacks: CellStacks;
  invX: CircleInventory;
  invO: CircleInventory;
  currentPlayer: Player; // should be "O" when called
  gridSize: number;
  winLength: number;
  checkWinner: (board: (Player | null)[], gridSize: number, winLength: number) => WinnerResult;
  maxDepth?: number; // optional depth limit (default: Infinity = full search)
}): CircleMove | null {
  const { stacks, invX, invO, currentPlayer, gridSize, winLength, checkWinner, maxDepth } = args;
  const resolvedMaxDepth = maxDepth ?? Infinity;

  const maximizingPlayer: Player = "O";
  const memo = new Map<string, number>();

  function minimax(node: {
    stacks: CellStacks;
    invX: CircleInventory;
    invO: CircleInventory;
    player: Player;
    ply: number;
  }, alpha: number, beta: number): number {
    const key = stateKey({
      stacks: node.stacks,
      invX: node.invX,
      invO: node.invO,
      currentPlayer: node.player,
    });

    const memoHit = memo.get(key);
    if (memoHit !== undefined) return memoHit;

    // Winner check
    const board = getTopOwnerBoard(node.stacks);
    const win = checkWinner(board, gridSize, winLength);
    if (win?.winner) {
      const score = terminalScore({
        winner: win.winner,
        plyFromRoot: node.ply,
        maximizingPlayer,
      });
      memo.set(key, score);
      return score;
    }

    // Depth limit check: return heuristic if we've reached max depth
    if (node.ply >= resolvedMaxDepth) {
      const score = evaluatePositionHeuristic({
        stacks: node.stacks,
        invX: node.invX,
        invO: node.invO,
        maximizingPlayer,
        gridSize,
      });
      memo.set(key, score);
      return score;
    }

    // Generate moves
    const inv = node.player === "X" ? node.invX : node.invO;
    const moves = getValidCircleMoves(node.stacks, inv);

    // No moves => draw
    if (moves.length === 0) {
      memo.set(key, 0);
      return 0;
    }

    const isMax = node.player === maximizingPlayer;
    let best = isMax ? -Infinity : Infinity;

    // Small move ordering: try larger captures first for pruning
    // (simulateCircleMove returns capturedSize; we use it cheaply here)
    const ordered = moves
      .map(m => {
        const sim = simulateCircleMove(node.stacks, inv, m, node.player);
        return { m, sim, cap: sim.capturedSize };
      })
      .sort((a, b) => b.cap - a.cap);

    for (const item of ordered) {
      const nextStacks = item.sim.newStacks;

      const nextInvX = node.player === "X" ? item.sim.newInventory : node.invX;
      const nextInvO = node.player === "O" ? item.sim.newInventory : node.invO;

      const nextPlayer: Player = node.player === "X" ? "O" : "X";

      const score = minimax(
        {
          stacks: nextStacks,
          invX: nextInvX,
          invO: nextInvO,
          player: nextPlayer,
          ply: node.ply + 1,
        },
        alpha,
        beta
      );

      if (isMax) {
        if (score > best) best = score;
        if (best > alpha) alpha = best;
        if (beta <= alpha) break; // prune
      } else {
        if (score < best) best = score;
        if (best < beta) beta = best;
        if (beta <= alpha) break; // prune
      }
    }

    memo.set(key, best);
    return best;
  }

  // Root: choose best move for currentPlayer
  const rootInv = currentPlayer === "X" ? invX : invO;
  const rootMoves = getValidCircleMoves(stacks, rootInv);
  if (rootMoves.length === 0) return null;

  let bestMove = rootMoves[0];
  let bestScore = -Infinity;

  for (const m of rootMoves) {
    const sim = simulateCircleMove(stacks, rootInv, m, currentPlayer);
    const nextStacks = sim.newStacks;

    const nextInvX = currentPlayer === "X" ? sim.newInventory : invX;
    const nextInvO = currentPlayer === "O" ? sim.newInventory : invO;

    const nextPlayer: Player = currentPlayer === "X" ? "O" : "X";

    const score = minimax(
      { stacks: nextStacks, invX: nextInvX, invO: nextInvO, player: nextPlayer, ply: 1 },
      -Infinity,
      Infinity
    );

    if (score > bestScore) {
      bestScore = score;
      bestMove = m;
    }
  }

  return bestMove;
}
