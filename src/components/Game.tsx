import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { GameConfig, GameState } from "../types/game";
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

export default function Game({ config, onBack }: GameProps) {
  const [gameState, setGameState] = useState<GameState>(() => ({
    board: Array(config.gridSize * config.gridSize).fill(null),
    currentPlayer: "X",
    turnNumber: 1,
    winner: null,
    winningLine: null,
    isDraw: false,
  }));
  const [showExitConfirm, setShowExitConfirm] = useState(false);
  const [lastMoveIndex, setLastMoveIndex] = useState<number | null>(null);
  const [isInputLocked, setIsInputLocked] = useState(false);

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
    // Only run if it's bot mode, O's turn, game not over, and input not already locked
    if (
      config.mode !== "bot" ||
      gameState.currentPlayer !== "O" ||
      gameState.winner !== null ||
      gameState.isDraw ||
      isInputLocked
    ) {
      return;
    }

    // Lock input while bot is "thinking"
    setIsInputLocked(true);

    // Short delay to make bot feel natural (500ms)
    const timerId = setTimeout(() => {
      const difficulty = config.difficulty || "normal";
      const botMoveIndex = getBotMove(
        gameState.board,
        difficulty,
        config.gridSize,
        config.winLength
      );

      if (botMoveIndex !== null) {
        executeMove(botMoveIndex);
      } else {
        // No valid move (shouldn't happen)
        setIsInputLocked(false);
      }
    }, 500);

    return () => clearTimeout(timerId);
  }, [gameState, config]);

  // Execute a move at the given index (shared by human and bot)
  const executeMove = (index: number) => {
    // Track the last move for animation
    setLastMoveIndex(index);

    setGameState(prev => {
      // Place mark
      const newBoard = [...prev.board];
      newBoard[index] = prev.currentPlayer;

      // Check for winner
      const winResult = checkWinner(newBoard, config.gridSize, config.winLength);
      if (winResult) {
        setIsInputLocked(false);
        return {
          ...prev,
          board: newBoard,
          winner: winResult.winner,
          winningLine: winResult.line,
        };
      }

      // Check for draw
      const isDraw = checkDraw(newBoard);
      if (isDraw) {
        setIsInputLocked(false);
        return {
          ...prev,
          board: newBoard,
          isDraw: true,
        };
      }

      // Continue game - switch player
      setIsInputLocked(false);
      return {
        ...prev,
        board: newBoard,
        currentPlayer: prev.currentPlayer === "X" ? "O" : "X",
        turnNumber: prev.turnNumber + 1,
      };
    });
  };

  const handleCellClick = (index: number) => {
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
          onContinue={() => setShowExitConfirm(false)}
          onQuit={handleQuit}
        />
      )}
    </motion.div>
  );
}
