import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { GameConfig, GameState, Placement, CellValue } from "../types/game";
import { checkWinner, checkDraw } from "../utils/gameLogic";
import { getBotMove } from "../utils/bot";
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
  const [gameState, setGameState] = useState<GameState>(() => ({
    board: Array(config.gridSize * config.gridSize).fill(null),
    currentPlayer: "X",
    turnNumber: 1,
    winner: null,
    winningLine: null,
    isDraw: false,
    placements: [],
    expiringIndices: [],
  }));
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
          setGameState({
            board: Array(config.gridSize * config.gridSize).fill(null),
            currentPlayer: "X",
            turnNumber: 1,
            winner: null,
            winningLine: null,
            isDraw: false,
            placements: [],
            expiringIndices: [],
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

    // Debug logging (DEV only)
    if (import.meta.env.DEV) {
      console.log("🤖 Bot turn starting:", {
        currentPlayer: gameState.currentPlayer,
        turnNumber: gameState.turnNumber,
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
  }, [config.mode, gameState.currentPlayer, gameState.winner, gameState.isDraw, gameState.placements.length]);

  // Execute a move at the given index (shared by human and bot)
  const executeMove = (index: number) => {
    // Track the last move for animation
    setLastMoveIndex(index);

    setGameState(prev => {
      const newTurnNumber = prev.turnNumber + 1;
      const ruleset = config.ruleset || "classic";
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

    // Ignore clicks if input is locked, game is over, or cell is occupied
    if (isInputLocked || gameState.winner || gameState.isDraw || gameState.board[index] !== null) {
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
    setGameState({
      board: Array(config.gridSize * config.gridSize).fill(null),
      currentPlayer: "X",
      turnNumber: 1,
      winner: null,
      winningLine: null,
      isDraw: false,
      placements: [],
      expiringIndices: [],
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

      {/* Bot thinking spinner */}
      <div style={{ height: "44px", display: "flex", alignItems: "center", justifyContent: "center" }}>
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

      {/* Game board */}
      <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center" }}>
        <GameBoard
          board={gameState.board}
          gridSize={config.gridSize}
          winningLine={gameState.winningLine}
          onCellClick={handleCellClick}
          lastMoveIndex={lastMoveIndex}
          expiringIndices={gameState.expiringIndices}
        />
      </div>

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
