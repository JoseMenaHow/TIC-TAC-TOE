import { useState } from "react";
import { motion } from "framer-motion";
import { BotDifficulty, GameConfig } from "../types/game";

interface BotSetupProps {
  onBack: () => void;
  onStartGame: (config: GameConfig) => void;
}

export default function BotSetup({ onBack, onStartGame }: BotSetupProps) {
  const [difficulty, setDifficulty] = useState<BotDifficulty>("normal");
  const gridSize = 3; // Locked to 3x3 for bot mode

  const handleStartGame = () => {
    const config: GameConfig = {
      mode: "bot",
      gridSize: gridSize,
      winLength: gridSize,
      difficulty: difficulty,
    };
    onStartGame(config);
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
          onClick={onBack}
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

      {/* Main content */}
      <div
        style={{
          width: "100%",
          maxWidth: "400px",
          display: "flex",
          flexDirection: "column",
          gap: "calc(var(--spacing-unit) * 2)",
        }}
      >
        {/* Title */}
        <h1
          className="text-section"
          style={{
            fontSize: "28px",
            fontWeight: 900,
            color: "var(--color-text-primary)",
            textAlign: "center",
          }}
        >
          Bot Setup
        </h1>

        {/* Difficulty Selector */}
        <div>
          <label
            className="text-body"
            style={{
              display: "block",
              marginBottom: "calc(var(--spacing-unit) * 0.75)",
              color: "var(--color-text-secondary)",
              fontWeight: 600,
            }}
          >
            Difficulty
          </label>
          <div
            style={{
              display: "flex",
              gap: "calc(var(--spacing-unit) * 0.5)",
            }}
          >
            {/* Easy chip */}
            <button
              onClick={() => setDifficulty("easy")}
              className="text-button"
              style={{
                flex: 1,
                padding: "calc(var(--spacing-unit) * 0.75)",
                borderRadius: "var(--radius-button)",
                backgroundColor: difficulty === "easy" ? "var(--color-primary-bg)" : "var(--color-surface)",
                color: difficulty === "easy" ? "var(--color-primary-text)" : "var(--color-text-primary)",
                cursor: "pointer",
                border: difficulty === "easy" ? "2px solid var(--color-primary-bg)" : "2px solid var(--color-border)",
              }}
            >
              Easy
            </button>

            {/* Normal chip */}
            <button
              onClick={() => setDifficulty("normal")}
              className="text-button"
              style={{
                flex: 1,
                padding: "calc(var(--spacing-unit) * 0.75)",
                borderRadius: "var(--radius-button)",
                backgroundColor: difficulty === "normal" ? "var(--color-primary-bg)" : "var(--color-surface)",
                color: difficulty === "normal" ? "var(--color-primary-text)" : "var(--color-text-primary)",
                cursor: "pointer",
                border: difficulty === "normal" ? "2px solid var(--color-primary-bg)" : "2px solid var(--color-border)",
              }}
            >
              Normal
            </button>

            {/* Hard chip */}
            <button
              onClick={() => setDifficulty("hard")}
              className="text-button"
              style={{
                flex: 1,
                padding: "calc(var(--spacing-unit) * 0.75)",
                borderRadius: "var(--radius-button)",
                backgroundColor: difficulty === "hard" ? "var(--color-primary-bg)" : "var(--color-surface)",
                color: difficulty === "hard" ? "var(--color-primary-text)" : "var(--color-text-primary)",
                cursor: "pointer",
                border: difficulty === "hard" ? "2px solid var(--color-primary-bg)" : "2px solid var(--color-border)",
              }}
            >
              Hard
            </button>
          </div>
        </div>

        {/* Grid Size Selector (locked to 3x3) */}
        <div>
          <label
            className="text-body"
            style={{
              display: "block",
              marginBottom: "calc(var(--spacing-unit) * 0.75)",
              color: "var(--color-text-secondary)",
              fontWeight: 600,
            }}
          >
            Grid Size
          </label>
          <div
            style={{
              display: "flex",
              gap: "calc(var(--spacing-unit) * 0.5)",
            }}
          >
            {/* 3x3 chip (locked/selected) */}
            <button
              className="text-button"
              disabled
              style={{
                flex: 1,
                padding: "calc(var(--spacing-unit) * 0.75)",
                borderRadius: "var(--radius-button)",
                backgroundColor: "var(--color-primary-bg)",
                color: "var(--color-primary-text)",
                cursor: "not-allowed",
                border: "2px solid var(--color-primary-bg)",
                opacity: 0.6,
              }}
            >
              3×3
            </button>

            {/* 4x4 chip (disabled) */}
            <button
              className="text-button"
              disabled
              style={{
                flex: 1,
                padding: "calc(var(--spacing-unit) * 0.75)",
                borderRadius: "var(--radius-button)",
                backgroundColor: "var(--color-surface)",
                color: "var(--color-text-secondary)",
                cursor: "not-allowed",
                border: "2px solid var(--color-border)",
                opacity: 0.4,
              }}
            >
              4×4
            </button>

            {/* 5x5 chip (disabled) */}
            <button
              className="text-button"
              disabled
              style={{
                flex: 1,
                padding: "calc(var(--spacing-unit) * 0.75)",
                borderRadius: "var(--radius-button)",
                backgroundColor: "var(--color-surface)",
                color: "var(--color-text-secondary)",
                cursor: "not-allowed",
                border: "2px solid var(--color-border)",
                opacity: 0.4,
              }}
            >
              5×5
            </button>
          </div>
        </div>

        {/* Start button */}
        <button
          onClick={handleStartGame}
          className="text-button"
          style={{
            width: "100%",
            padding: "calc(var(--spacing-unit) * 1)",
            borderRadius: "var(--radius-button)",
            backgroundColor: "var(--color-primary-bg)",
            color: "var(--color-primary-text)",
            cursor: "pointer",
            marginTop: "calc(var(--spacing-unit) * 2)",
            fontSize: "18px",
            fontWeight: 700,
          }}
        >
          Start Game
        </button>
      </div>
    </motion.div>
  );
}
