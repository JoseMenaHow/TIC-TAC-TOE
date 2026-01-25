import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { GameConfig, GameState } from "../types/game";
import { checkWinner, checkDraw } from "../utils/gameLogic";
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
          setShowExitConfirm(false);
          break;
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [config.gridSize]);

  const handleCellClick = (index: number) => {
    // Ignore clicks if game is over or cell is occupied
    if (gameState.winner || gameState.isDraw || gameState.board[index] !== null) {
      return;
    }

    // Track the last move for animation
    setLastMoveIndex(index);

    // Place mark
    const newBoard = [...gameState.board];
    newBoard[index] = gameState.currentPlayer;

    // Check for winner
    const winResult = checkWinner(newBoard, config.gridSize, config.winLength);
    if (winResult) {
      setGameState({
        ...gameState,
        board: newBoard,
        winner: winResult.winner,
        winningLine: winResult.line,
      });
      return;
    }

    // Check for draw
    const isDraw = checkDraw(newBoard);
    if (isDraw) {
      setGameState({
        ...gameState,
        board: newBoard,
        isDraw: true,
      });
      return;
    }

    // Continue game - switch player
    setGameState({
      ...gameState,
      board: newBoard,
      currentPlayer: gameState.currentPlayer === "X" ? "O" : "X",
      turnNumber: gameState.turnNumber + 1,
    });
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
