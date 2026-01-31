import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { GameConfig, GameState, Placement, CellValue } from "../types/game";
import { checkWinner, checkDraw } from "../utils/gameLogic";
import { getBotMove } from "../utils/bot";
import { initializeCircleInventory, placeCircle, getTopOwnerBoard, checkCirclesDraw, getNextAvailableSize, getValidCircleMoves, simulateCircleMove, scoreCircleMoveHeuristic, getTopCircle } from "../utils/circleLogic";
import { computeBestCirclesMoveHard } from "../utils/circlesHardBot";
import GameBoard from "./GameBoard";
import TurnIndicator from "./TurnIndicator";
import WinModal from "./WinModal";
import DrawModal from "./DrawModal";
import ExitConfirmModal from "./ExitConfirmModal";

interface GameProps {
  config: GameConfig;
  onBack: () => void;
}

// Helper: Derive board from placements
function deriveBoardFromPlacements(placements: Placement[], gridSize: number): CellValue[] {
  const board: CellValue[] = Array(gridSize * gridSize).fill(null);
  for (const placement of placements) {
    board[placement.index] = placement.value;
  }
  return board;
}

export default function Game({ config, onBack }: GameProps) {
  const [gameState, setGameState] = useState<GameState>(() => {
    const ruleset = config.ruleset || "classic";
    const isCircles = ruleset === "circles";

    return {
      board: Array(config.gridSize * config.gridSize).fill(null),
      currentPlayer: "X",
      turnNumber: 1,
      winner: null,
      winningLine: null,
      isDraw: false,
      placements: [],
      expiringIndices: [],
      cellStacks: isCircles ? Array.from({ length: config.gridSize * config.gridSize }, () => []) : null,
      inventoryX: isCircles ? initializeCircleInventory() : null,
      inventoryO: isCircles ? initializeCircleInventory() : null,
      selectedSize: isCircles ? 1 : null,
    };
  });
  const [showExitConfirm, setShowExitConfirm] = useState(false);
  const [lastMoveIndex, setLastMoveIndex] = useState<number | null>(null);
  const [isInputLocked, setIsInputLocked] = useState(false);

  // Ref to track latest placements for bot move computation
  const placementsRef = useRef<Placement[]>(gameState.placements);

  // Ref to track bot timer for proper cleanup
  const botTimerRef = useRef<number | null>(null);

  // Ref to track failsafe unlock timer
  const failsafeTimerRef = useRef<number | null>(null);

  // Ref to track if bot move is already pending (prevents double-scheduling)
  const botPendingRef = useRef<boolean>(false);

  // Update ref whenever placements change
  useEffect(() => {
    placementsRef.current = gameState.placements;
  }, [gameState.placements]);

  // Show spinner when bot is thinking
  const showSpinner = config.mode === "bot" && isInputLocked;

  // DEV-ONLY: Keyboard shortcuts for testing result modals
  useEffect(() => {
    if (!import.meta.env.DEV) return;

    console.log("🎮 DEV shortcuts: [1] X wins | [2] O wins | [3] Draw | [0] Close modal | [r] Reset");

    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore if typing in an input field
      const target = e.target as HTMLElement;
      if (
        target.tagName === "INPUT" ||
        target.tagName === "TEXTAREA" ||
        target.isContentEditable
      ) {
        return;
      }

      switch (e.key) {
        case "1":
          // Player 1 wins (X)
          setGameState(prev => ({
            ...prev,
            winner: "X",
            winningLine: [0, 1, 2],
            isDraw: false,
          }));
          setShowExitConfirm(false);
          break;
        case "2":
          // Player 2 wins (O)
          setGameState(prev => ({
            ...prev,
            winner: "O",
            winningLine: [0, 1, 2],
            isDraw: false,
          }));
          setShowExitConfirm(false);
          break;
        case "3":
          // Draw
          setGameState(prev => ({
            ...prev,
            winner: null,
            winningLine: null,
            isDraw: true,
          }));
          setShowExitConfirm(false);
          break;
        case "0":
          // Close modal (resume game)
          setGameState(prev => ({
            ...prev,
            winner: null,
            winningLine: null,
            isDraw: false,
          }));
          setShowExitConfirm(false);
          break;
        case "r":
          // Reset game
          const ruleset = config.ruleset || "classic";
          const isCircles = ruleset === "circles";
          setGameState({
            board: Array(config.gridSize * config.gridSize).fill(null),
            currentPlayer: "X",
            turnNumber: 1,
            winner: null,
            winningLine: null,
            isDraw: false,
            placements: [],
            expiringIndices: [],
            cellStacks: isCircles ? Array.from({ length: config.gridSize * config.gridSize }, () => []) : null,
            inventoryX: isCircles ? initializeCircleInventory() : null,
            inventoryO: isCircles ? initializeCircleInventory() : null,
            selectedSize: isCircles ? 1 : null,
          });
          setLastMoveIndex(null);
          setIsInputLocked(false);
          setShowExitConfirm(false);
          break;
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [config.gridSize]);

  // Bot turn handler
  useEffect(() => {
    // Only run if it's bot mode, O's turn, and game not over
    if (
      config.mode !== "bot" ||
      gameState.currentPlayer !== "O" ||
      gameState.winner !== null ||
      gameState.isDraw
    ) {
      return;
    }

    // Guard: Don't schedule if bot move is already pending
    if (botPendingRef.current) {
      if (import.meta.env.DEV) {
        console.log("🤖 Bot move already pending, skipping");
      }
      return;
    }

    const ruleset = config.ruleset || "classic";

    // Debug logging (DEV only)
    if (import.meta.env.DEV) {
      console.log("🤖 Bot turn starting:", {
        currentPlayer: gameState.currentPlayer,
        turnNumber: gameState.turnNumber,
        ruleset,
        placementsCount: gameState.placements.length,
      });
    }

    // Mark bot move as pending
    botPendingRef.current = true;

    // Lock input while bot is "thinking"
    setIsInputLocked(true);

    // Failsafe: Auto-unlock after 2 seconds if bot doesn't move
    failsafeTimerRef.current = window.setTimeout(() => {
      if (import.meta.env.DEV) {
        console.warn("⚠️ Bot failsafe triggered - unlocking after 2s timeout");
      }
      setIsInputLocked(false);
      botPendingRef.current = false;
    }, 2000);

    // Short delay to make bot feel natural (500ms)
    botTimerRef.current = window.setTimeout(() => {
      // Clear failsafe timer since we're executing now
      if (failsafeTimerRef.current !== null) {
        clearTimeout(failsafeTimerRef.current);
        failsafeTimerRef.current = null;
      }

      // Circles bot path (difficulty-based AI)
      if (ruleset === "circles") {
        // Must have circles state initialized
        if (!gameState.cellStacks || !gameState.inventoryO) {
          console.error("Circles bot: state not initialized");
          setIsInputLocked(false);
          botPendingRef.current = false;
          return;
        }

        const gridSize = config.gridSize;
        const winLength = config.winLength;

        const allMoves = getValidCircleMoves(gameState.cellStacks, gameState.inventoryO);

        if (allMoves.length === 0) {
          // No valid moves; draw logic should resolve on next state update
          if (import.meta.env.DEV) {
            console.log("🤖 Bot has no valid moves");
          }
          setIsInputLocked(false);
          botPendingRef.current = false;
          return;
        }

        const difficulty = config.difficulty || "normal";

        // Helper: pick a move and execute it (selectedSize -> executeMove)
        const commitMove = (move: { cellIndex: number; size: 1 | 2 | 3 }) => {
          if (import.meta.env.DEV) {
            console.log("🤖 Bot chose circle move:", move, "difficulty:", difficulty);
          }
          setGameState(prev => {
            if (!prev.cellStacks || !prev.inventoryO) return prev;
            return { ...prev, selectedSize: move.size };
          });
          window.setTimeout(() => {
            executeMove(move.cellIndex);
            botPendingRef.current = false;
          }, 0);
        };

        // EASY: random valid move
        if (difficulty === "easy") {
          const move = allMoves[Math.floor(Math.random() * allMoves.length)];
          commitMove(move);
          return;
        }

        // HARD: full minimax solver (near-unbeatable)
        if (difficulty === "hard") {
          if (!gameState.inventoryX) {
            console.error("Circles bot hard: inventoryX not initialized");
            setIsInputLocked(false);
            botPendingRef.current = false;
            return;
          }

          const move = computeBestCirclesMoveHard({
            stacks: gameState.cellStacks,
            invX: gameState.inventoryX,
            invO: gameState.inventoryO,
            currentPlayer: "O",
            gridSize,
            winLength,
            checkWinner,
          });

          if (!move) {
            // No valid moves
            setIsInputLocked(false);
            botPendingRef.current = false;
            return;
          }

          commitMove(move);
          return;
        }

        // NORMAL: tactical heuristic with 1-ply safety
        // 1) Win now if possible
        // 2) Block X immediate win if possible
        // 3) Otherwise choose best heuristic move with 1-ply safety

        // 1) Win now
        for (const move of allMoves) {
          const sim = simulateCircleMove(gameState.cellStacks, gameState.inventoryO, move, "O");
          const board = getTopOwnerBoard(sim.newStacks);
          const win = checkWinner(board, gridSize, winLength);
          if (win?.winner === "O") {
            commitMove(move);
            return;
          }
        }

        // 2) Block X immediate win
        // Find any X winning move next turn; try to prevent it by taking that cell with ANY size that is valid now.
        let threats: number[] = [];
        if (gameState.inventoryX) {
          const xMoves = getValidCircleMoves(gameState.cellStacks, gameState.inventoryX);
          for (const xm of xMoves) {
            const simX = simulateCircleMove(gameState.cellStacks, gameState.inventoryX, xm, "X");
            const boardX = getTopOwnerBoard(simX.newStacks);
            const winX = checkWinner(boardX, gridSize, winLength);
            if (winX?.winner === "X") threats.push(xm.cellIndex);
          }
        }
        threats = Array.from(new Set(threats));

        if (threats.length > 0) {
          const threatSet = new Set(threats);

          // For each threatened cell, choose the LARGEST size we can legally place there (given inventory)
          const bestPerThreatCell = new Map<number, { cellIndex: number; size: 1 | 2 | 3 }>();

          for (const m of allMoves) {
            if (!threatSet.has(m.cellIndex)) continue;

            const existing = bestPerThreatCell.get(m.cellIndex);
            // keep the largest size move for that threat cell
            if (!existing || m.size > existing.size) {
              bestPerThreatCell.set(m.cellIndex, m);
            }
          }

          const maxBlockingMoves = Array.from(bestPerThreatCell.values());

          if (maxBlockingMoves.length > 0) {
            // If there is exactly one threat cell, just play that max-size block immediately
            if (maxBlockingMoves.length === 1) {
              commitMove(maxBlockingMoves[0]);
              return;
            }

            // If there are multiple threat cells, pick the best one using heuristic scoring
            let best = maxBlockingMoves[0];
            let bestScore = -Infinity;

            for (const m of maxBlockingMoves) {
              const sim = simulateCircleMove(gameState.cellStacks!, gameState.inventoryO!, m, "O");
              const proj = getTopOwnerBoard(sim.newStacks);

              const top = getTopCircle(gameState.cellStacks!, m.cellIndex);
              const topOwner = top ? top.owner : null;
              const topSize = top ? top.size : 0;

              const score = scoreCircleMoveHeuristic({
                move: m,
                capturedSize: sim.capturedSize,
                projectedBoard: proj,
                gridSize,
                topCircleOwner: topOwner,
                topCircleSize: topSize as 0 | 1 | 2 | 3,
                currentPlayer: "O",
              });

              // Extra defensive bias: prefer larger size even more when blocking
              const defenseBonus = m.size * 8;
              const finalScore = score + defenseBonus;

              if (finalScore > bestScore) {
                bestScore = finalScore;
                best = m;
              }
            }

            commitMove(best);
            return;
          }
        }

        // 3) Heuristic pick with 1-ply safety
        type Scored = { move: { cellIndex: number; size: 1 | 2 | 3 }; score: number; allowsImmediateLoss: boolean };

        const scored: Scored[] = allMoves.map(m => {
          const simO = simulateCircleMove(gameState.cellStacks!, gameState.inventoryO!, m, "O");
          const projO = getTopOwnerBoard(simO.newStacks);

          // Get top circle info for the target cell before our move
          const top = getTopCircle(gameState.cellStacks!, m.cellIndex);
          const topOwner = top ? top.owner : null;
          const topSize = top ? top.size : 0;

          let score = scoreCircleMoveHeuristic({
            move: m,
            capturedSize: simO.capturedSize,
            projectedBoard: projO,
            gridSize,
            topCircleOwner: topOwner,
            topCircleSize: topSize as 0 | 1 | 2 | 3,
            currentPlayer: "O",
          });

          // 1-ply safety check (does X have an immediate win after this?)
          // Applied to both Normal and Hard
          let allowsImmediateLoss = false;
          if (gameState.inventoryX) {
            const xMovesAfter = getValidCircleMoves(simO.newStacks, gameState.inventoryX);
            for (const xm of xMovesAfter) {
              const simX = simulateCircleMove(simO.newStacks, gameState.inventoryX, xm, "X");
              const projX = getTopOwnerBoard(simX.newStacks);
              const winX = checkWinner(projX, gridSize, winLength);
              if (winX?.winner === "X") {
                allowsImmediateLoss = true;
                break;
              }
            }
            if (allowsImmediateLoss) score -= 1000; // huge penalty
          }

          return { move: m, score, allowsImmediateLoss };
        });

        scored.sort((a, b) => b.score - a.score);

        // Take best scored move
        commitMove(scored[0].move);
        return;
      }

      // Existing classic/decay bot logic
      // Derive fresh board from latest placements (after any decay updates)
      const currentBoard = deriveBoardFromPlacements(placementsRef.current, config.gridSize);

      if (import.meta.env.DEV) {
        const availableMoves = currentBoard
          .map((cell, idx) => (cell === null ? idx : -1))
          .filter(idx => idx !== -1);
        console.log("🤖 Bot computing move:", {
          board: currentBoard,
          availableMoves,
          placementsCount: placementsRef.current.length,
        });
      }

      const difficulty = config.difficulty || "normal";
      const botMoveIndex = getBotMove(
        currentBoard,
        difficulty,
        config.gridSize,
        config.winLength
      );

      if (import.meta.env.DEV) {
        console.log("🤖 Bot chose move:", botMoveIndex);
      }

      // Validate move is still available
      if (botMoveIndex !== null && currentBoard[botMoveIndex] === null) {
        executeMove(botMoveIndex);
        botPendingRef.current = false;
      } else if (botMoveIndex !== null) {
        // Chosen move is no longer valid, find any available move
        console.warn("⚠️ Bot's chosen move is invalid, finding alternative");
        const availableIndex = currentBoard.findIndex(cell => cell === null);
        if (availableIndex !== -1) {
          executeMove(availableIndex);
          botPendingRef.current = false;
        } else {
          setIsInputLocked(false);
          botPendingRef.current = false;
        }
      } else {
        // No valid move (shouldn't happen)
        setIsInputLocked(false);
        botPendingRef.current = false;
      }

      botTimerRef.current = null;
    }, 500);

    // Cleanup function - critical for StrictMode
    return () => {
      // Clear bot timer
      if (botTimerRef.current !== null) {
        clearTimeout(botTimerRef.current);
        botTimerRef.current = null;
      }

      // Clear failsafe timer
      if (failsafeTimerRef.current !== null) {
        clearTimeout(failsafeTimerRef.current);
        failsafeTimerRef.current = null;
      }

      // CRITICAL: Reset pending flag and unlock
      botPendingRef.current = false;
      setIsInputLocked(false);
    };
  }, [config.mode, config.ruleset, gameState.currentPlayer, gameState.winner, gameState.isDraw, gameState.placements.length, gameState.cellStacks, gameState.inventoryO]);

  // Execute a move at the given index (shared by human and bot)
  const executeMove = (index: number) => {
    // Track the last move for animation
    setLastMoveIndex(index);

    setGameState(prev => {
      const newTurnNumber = prev.turnNumber + 1;
      const ruleset = config.ruleset || "classic";

      // Branch: Circle vs Circle ruleset
      if (ruleset === "circles") {
        // Guard: Ensure circles state exists
        if (!prev.cellStacks || !prev.inventoryX || !prev.inventoryO || prev.selectedSize === null) {
          console.error("Circles state not initialized");
          return prev;
        }

        // Get current player's inventory
        const currentInventory = prev.currentPlayer === "X" ? prev.inventoryX : prev.inventoryO;

        try {
          // Place circle
          const { newStacks, newInventory } = placeCircle(
            prev.cellStacks,
            currentInventory,
            index,
            prev.selectedSize,
            prev.currentPlayer
          );

          // Update inventories
          const updatedInventoryX = prev.currentPlayer === "X" ? newInventory : prev.inventoryX;
          const updatedInventoryO = prev.currentPlayer === "O" ? newInventory : prev.inventoryO;

          // Derive board from top circles
          const newBoard = getTopOwnerBoard(newStacks);

          // Check for winner
          const winResult = checkWinner(newBoard, config.gridSize, config.winLength);
          if (winResult) {
            return {
              ...prev,
              board: newBoard,
              cellStacks: newStacks,
              inventoryX: updatedInventoryX,
              inventoryO: updatedInventoryO,
              winner: winResult.winner,
              winningLine: winResult.line,
              turnNumber: newTurnNumber,
            };
          }

          // Check for draw (both players have no valid moves)
          const isDraw = checkCirclesDraw(newStacks, updatedInventoryX, updatedInventoryO);
          if (isDraw) {
            return {
              ...prev,
              board: newBoard,
              cellStacks: newStacks,
              inventoryX: updatedInventoryX,
              inventoryO: updatedInventoryO,
              isDraw: true,
              turnNumber: newTurnNumber,
            };
          }

          // Switch player
          const nextPlayer = prev.currentPlayer === "X" ? "O" : "X";
          const nextInventory = nextPlayer === "X" ? updatedInventoryX : updatedInventoryO;

          // Auto-select next available size for next player if current selection is invalid
          let nextSelectedSize: 1 | 2 | 3 | null = prev.selectedSize;
          const sizeKey = prev.selectedSize === 1 ? "small" : prev.selectedSize === 2 ? "medium" : "large";
          if (nextInventory[sizeKey] <= 0) {
            nextSelectedSize = getNextAvailableSize(nextInventory);
          }

          return {
            ...prev,
            board: newBoard,
            cellStacks: newStacks,
            inventoryX: updatedInventoryX,
            inventoryO: updatedInventoryO,
            currentPlayer: nextPlayer,
            selectedSize: nextSelectedSize,
            turnNumber: newTurnNumber,
          };
        } catch (error) {
          console.error("Failed to place circle:", error);
          return prev;
        }
      }

      // Classic/Decay rulesets
      const decayTurns = config.decayTurns || 7;

      // Add new placement
      const newPlacement: Placement = {
        index,
        value: prev.currentPlayer,
        placedTurn: prev.turnNumber,
      };
      let newPlacements = [...prev.placements, newPlacement];

      // Find expiring placements if ruleset is "decay"
      const expiringIndices: number[] = [];
      if (ruleset === "decay") {
        // Check which placements should expire (but keep them for animation)
        newPlacements.forEach(p => {
          const age = prev.turnNumber - p.placedTurn;
          if (age >= decayTurns) {
            expiringIndices.push(p.index);
          }
        });

        // If there are expiring marks, schedule their removal after animation
        if (expiringIndices.length > 0) {
          setTimeout(() => {
            setGameState(current => {
              // Remove expired placements
              const filteredPlacements = current.placements.filter(
                p => !expiringIndices.includes(p.index)
              );
              const updatedBoard = deriveBoardFromPlacements(filteredPlacements, config.gridSize);

              return {
                ...current,
                placements: filteredPlacements,
                board: updatedBoard,
                expiringIndices: [], // Clear expiring list after removal
              };
            });
          }, 200); // Match animation duration
        }
      }

      // Derive board from placements (including expiring ones, for now)
      const newBoard = deriveBoardFromPlacements(newPlacements, config.gridSize);

      // Check for winner
      const winResult = checkWinner(newBoard, config.gridSize, config.winLength);
      if (winResult) {
        return {
          ...prev,
          board: newBoard,
          placements: newPlacements,
          expiringIndices,
          winner: winResult.winner,
          winningLine: winResult.line,
          turnNumber: newTurnNumber,
        };
      }

      // Check for draw
      const isDraw = checkDraw(newBoard);
      if (isDraw) {
        return {
          ...prev,
          board: newBoard,
          placements: newPlacements,
          expiringIndices,
          isDraw: true,
          turnNumber: newTurnNumber,
        };
      }

      // Continue game - switch player
      return {
        ...prev,
        board: newBoard,
        placements: newPlacements,
        expiringIndices,
        currentPlayer: prev.currentPlayer === "X" ? "O" : "X",
        turnNumber: newTurnNumber,
      };
    });

    // Unlock input after move is complete (outside state updater)
    setIsInputLocked(false);
  };

  const handleCellClick = (index: number) => {
    // Prevent human from playing on bot's turn
    if (config.mode === "bot" && gameState.currentPlayer === "O") {
      if (import.meta.env.DEV) {
        console.warn("⚠️ Human attempted to play on bot's turn");
      }
      return;
    }

    // Ignore clicks if input is locked or game is over
    if (isInputLocked || gameState.winner || gameState.isDraw) {
      return;
    }

    const ruleset = config.ruleset || "classic";

    // Branch: Circle vs Circle validation
    if (ruleset === "circles") {
      // Ensure circles state exists
      if (!gameState.cellStacks || gameState.selectedSize === null) {
        return;
      }

      // Check if this is a valid circle placement
      const stack = gameState.cellStacks[index];
      const canPlace = stack.length === 0 || (stack.length > 0 && gameState.selectedSize > stack[stack.length - 1].size);

      if (!canPlace) {
        return;
      }

      executeMove(index);
      return;
    }

    // Classic/Decay: cell must be empty
    if (gameState.board[index] !== null) {
      return;
    }

    executeMove(index);
  };

  const handleBack = () => {
    const gameInProgress = !gameState.winner && !gameState.isDraw && gameState.board.some(cell => cell !== null);
    if (gameInProgress) {
      setShowExitConfirm(true);
    } else {
      onBack();
    }
  };

  const handlePlayAgain = () => {
    const ruleset = config.ruleset || "classic";
    const isCircles = ruleset === "circles";
    setGameState({
      board: Array(config.gridSize * config.gridSize).fill(null),
      currentPlayer: "X",
      turnNumber: 1,
      winner: null,
      winningLine: null,
      isDraw: false,
      placements: [],
      expiringIndices: [],
      cellStacks: isCircles ? Array.from({ length: config.gridSize * config.gridSize }, () => []) : null,
      inventoryX: isCircles ? initializeCircleInventory() : null,
      inventoryO: isCircles ? initializeCircleInventory() : null,
      selectedSize: isCircles ? 1 : null,
    });
    setLastMoveIndex(null);
    setIsInputLocked(false);
  };

  const handleQuit = () => {
    onBack();
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
      style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        padding: "var(--spacing-unit)",
      }}
    >
      {/* DEV DEBUG HUD */}
      {import.meta.env.DEV && (
        <div
          style={{
            position: "fixed",
            top: "8px",
            left: "8px",
            backgroundColor: "rgba(0, 0, 0, 0.8)",
            color: "#00ff00",
            padding: "8px",
            borderRadius: "4px",
            fontSize: "10px",
            fontFamily: "monospace",
            zIndex: 9999,
            lineHeight: "1.4",
          }}
        >
          <div>Ruleset: {config.ruleset || "classic"}</div>
          <div>Turn: {gameState.turnNumber}</div>
          <div>Current: {gameState.currentPlayer}</div>
          <div>
            IsBotTurn: {config.mode === "bot" && gameState.currentPlayer === "O" ? "YES" : "NO"}
          </div>
          <div>Placements: {gameState.placements.length}</div>
          <div>
            EmptyCells: {gameState.board.filter(c => c === null).length}
          </div>
          <div>Locked: {isInputLocked ? "YES" : "NO"}</div>
        </div>
      )}

      {/* Back button */}
      <div style={{ width: "100%", maxWidth: "400px", marginBottom: "calc(var(--spacing-unit) * 2)" }}>
        <button
          onClick={handleBack}
          style={{
            width: "48px",
            height: "48px",
            borderRadius: "var(--radius-button)",
            backgroundColor: "var(--color-surface)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "20px",
            cursor: "pointer",
          }}
        >
          ←
        </button>
      </div>

      {/* Top inventory (circles only) - Always O (Red/Player 2 in 1v1, Bot in vs bot) */}
      {config.ruleset === "circles" && gameState.inventoryX && gameState.inventoryO && (
        <div style={{ width: "100%", maxWidth: "400px", marginBottom: "calc(var(--spacing-unit) * 1.5)" }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "12px",
              padding: "8px 16px",
              backgroundColor: "var(--color-surface)",
              borderRadius: "var(--radius-card)",
            }}
          >
            <span
              style={{
                fontSize: "13px",
                fontWeight: 600,
                color: "var(--color-text-secondary)",
                minWidth: "70px",
              }}
            >
              {config.mode === "bot" ? "Bot" : "Player 2"}
            </span>
            <div style={{ display: "flex", gap: "8px" }}>
              {([1, 2, 3] as const).map(size => {
                const topInventory = gameState.inventoryO;
                const sizeKey = size === 1 ? "small" : size === 2 ? "medium" : "large";
                const count = topInventory![sizeKey];
                const sizePx = size === 1 ? 16 : size === 2 ? 22 : 28;
                const isBotMode = config.mode === "bot";
                const topSelectable = !isBotMode && gameState.currentPlayer === "O";
                const isDisabled = !topSelectable || count === 0;
                const isSelected = gameState.selectedSize === size && gameState.currentPlayer === "O";

                return (
                  <button
                    key={size}
                    type="button"
                    disabled={isDisabled}
                    onClick={() => {
                      if (!isDisabled) {
                        setGameState(prev => ({ ...prev, selectedSize: size }));
                      }
                    }}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "4px",
                      padding: "4px 8px",
                      backgroundColor: "var(--color-background)",
                      borderRadius: "12px",
                      opacity: isDisabled ? 0.4 : 1,
                      cursor: isDisabled ? "not-allowed" : "pointer",
                      border: "none",
                      outline: isSelected ? "3px solid var(--color-o)" : "none",
                      outlineOffset: "-3px",
                      transition: "outline 0.15s ease, opacity 0.15s ease",
                    }}
                  >
                    <div
                      style={{
                        width: `${sizePx}px`,
                        height: `${sizePx}px`,
                        borderRadius: "9999px",
                        backgroundColor: "var(--color-o)",
                      }}
                    />
                    <span
                      style={{
                        fontSize: "12px",
                        fontWeight: 600,
                        color: "var(--color-text-primary)",
                      }}
                    >
                      ×{count}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* BoardStage: Fixed-size container for circles mode (no layout shift) */}
      {config.ruleset === "circles" ? (
        <div
          style={{
            position: "relative",
            width: "100%",
            maxWidth: "400px",
            aspectRatio: "1",
            margin: "0 auto",
          }}
        >
          {/* Game board */}
          <GameBoard
            board={gameState.board}
            gridSize={config.gridSize}
            winningLine={gameState.winningLine}
            onCellClick={handleCellClick}
            lastMoveIndex={lastMoveIndex}
            expiringIndices={gameState.expiringIndices}
            cellStacks={gameState.cellStacks}
          />

          {/* Bot thinking overlay (absolute, no layout impact) */}
          {showSpinner && (
            <div
              style={{
                position: "absolute",
                inset: "0",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                gap: "12px",
                pointerEvents: "none",
                borderRadius: "var(--radius-card)",
              }}
            >
              <div
                style={{
                  width: "40px",
                  height: "40px",
                  border: "5px solid #D1D1D1",
                  borderTop: "5px solid var(--color-x)",
                  borderRadius: "50%",
                  animation: "spin 1s linear infinite",
                }}
              />
              <div
                style={{
                  fontSize: "14px",
                  color: "var(--color-text-secondary)",
                  fontWeight: 600,
                }}
              >
                Bot thinking...
              </div>
            </div>
          )}
        </div>
      ) : (
        // Classic/decay: flex layout with spinner above
        <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", position: "relative" }}>
          <GameBoard
            board={gameState.board}
            gridSize={config.gridSize}
            winningLine={gameState.winningLine}
            onCellClick={handleCellClick}
            lastMoveIndex={lastMoveIndex}
            expiringIndices={gameState.expiringIndices}
            cellStacks={gameState.cellStacks}
          />

          {/* Classic/decay spinner (in-flow as before) */}
          <div style={{ position: "absolute", top: "-60px", left: "50%", transform: "translateX(-50%)" }}>
            {showSpinner && (
              <div
                style={{
                  width: "40px",
                  height: "40px",
                  border: "5px solid #D1D1D1",
                  borderTop: "5px solid var(--color-background)",
                  borderRadius: "50%",
                  animation: "spin 1s linear infinite",
                }}
              />
            )}
          </div>
        </div>
      )}

      {/* Bottom inventory (circles only) - Always X (Green/Player 1 in 1v1, You in vs bot) */}
      {config.ruleset === "circles" && gameState.inventoryX && gameState.inventoryO && (
        <div style={{ width: "100%", maxWidth: "400px", marginTop: "calc(var(--spacing-unit) * 2)" }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "12px",
              padding: "8px 16px",
              backgroundColor: "var(--color-surface)",
              borderRadius: "var(--radius-card)",
            }}
          >
            <span
              style={{
                fontSize: "13px",
                fontWeight: 600,
                color: "var(--color-text-secondary)",
                minWidth: "70px",
              }}
            >
              {config.mode === "bot" ? "You" : "Player 1"}
            </span>
            <div style={{ display: "flex", gap: "8px" }}>
              {([1, 2, 3] as const).map(size => {
                const bottomInventory = gameState.inventoryX;
                const sizeKey = size === 1 ? "small" : size === 2 ? "medium" : "large";
                const count = bottomInventory![sizeKey];
                const sizePx = size === 1 ? 16 : size === 2 ? 22 : 28;
                const bottomSelectable = gameState.currentPlayer === "X";
                const isDisabled = !bottomSelectable || count === 0;
                const isSelected = gameState.selectedSize === size && gameState.currentPlayer === "X";

                return (
                  <button
                    key={size}
                    type="button"
                    disabled={isDisabled}
                    onClick={() => {
                      if (!isDisabled) {
                        setGameState(prev => ({ ...prev, selectedSize: size }));
                      }
                    }}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "4px",
                      padding: "4px 8px",
                      backgroundColor: "var(--color-background)",
                      borderRadius: "12px",
                      opacity: isDisabled ? 0.4 : 1,
                      cursor: isDisabled ? "not-allowed" : "pointer",
                      border: "none",
                      outline: isSelected ? "3px solid var(--color-x)" : "none",
                      outlineOffset: "-3px",
                      transition: "outline 0.15s ease, opacity 0.15s ease",
                    }}
                  >
                    <div
                      style={{
                        width: `${sizePx}px`,
                        height: `${sizePx}px`,
                        borderRadius: "9999px",
                        backgroundColor: "var(--color-x)",
                      }}
                    />
                    <span
                      style={{
                        fontSize: "12px",
                        fontWeight: 600,
                        color: "var(--color-text-primary)",
                      }}
                    >
                      ×{count}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Turn indicator */}
      <div style={{ marginTop: "calc(var(--spacing-unit) * 2)", marginBottom: "calc(var(--spacing-unit) * 2)" }}>
        <TurnIndicator
          turnNumber={gameState.turnNumber}
          currentPlayer={gameState.currentPlayer}
        />
      </div>

      {/* Modals */}
      {gameState.winner && (
        <WinModal
          winner={gameState.winner}
          onPlayAgain={handlePlayAgain}
          onQuit={handleQuit}
        />
      )}

      {gameState.isDraw && (
        <DrawModal
          onPlayAgain={handlePlayAgain}
          onQuit={handleQuit}
        />
      )}

      {showExitConfirm && (
        <ExitConfirmModal
          onQuit={handleQuit}
          onBack={() => setShowExitConfirm(false)}
        />
      )}
    </motion.div>
  );
}
