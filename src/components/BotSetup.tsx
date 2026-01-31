import { useState } from "react";
import { motion } from "framer-motion";
import { BotDifficulty, GameConfig, Ruleset } from "../types/game";

interface GameSetupProps {
  mode: "local" | "bot";
  onBack: () => void;
  onStartGame: (config: GameConfig) => void;
}

export default function GameSetup({ mode, onBack, onStartGame }: GameSetupProps) {
  const [difficulty, setDifficulty] = useState<BotDifficulty>("normal");
  const [ruleset, setRuleset] = useState<Ruleset>("classic");
  const [decayTurns, setDecayTurns] = useState<number>(7);
  const gridSize = 3; // Locked to 3x3

  // Ruleset descriptions
  const RULESET_DESCRIPTIONS: Record<Ruleset, string> = {
    classic: "Play the classic rules — first to connect 3 wins.",
    decay: "Marks disappear after a set number of turns, keeping the board in motion.",
    circles: "Place circles of different sizes. Larger circles capture smaller ones.",
  };

  const handleStartGame = () => {
    const config: GameConfig = {
      mode: mode,
      gridSize: gridSize,
      winLength: gridSize,
      ...(mode === "bot" && { difficulty: difficulty }),
      ruleset: ruleset,
      decayTurns: ruleset === "decay" ? decayTurns : undefined,
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
          gap: "calc(var(--spacing-unit) * 2.5)",
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
          {mode === "bot" ? "Vs Bot" : "Local 1v1"}
        </h1>

        {/* Ruleset Dropdown */}
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
            Ruleset
          </label>
          <select
            value={ruleset}
            onChange={(e) => setRuleset(e.target.value as Ruleset)}
            className="text-button"
            style={{
              width: "100%",
              padding: "calc(var(--spacing-unit) * 1)",
              borderRadius: "var(--radius-button)",
              backgroundColor: "var(--color-surface)",
              color: "var(--color-text-primary)",
              border: "2px solid var(--color-border)",
              fontSize: "16px",
              fontWeight: 600,
              cursor: "pointer",
              appearance: "none",
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='12' height='8' viewBox='0 0 12 8' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M1 1.5L6 6.5L11 1.5' stroke='%23666' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E")`,
              backgroundRepeat: "no-repeat",
              backgroundPosition: "right calc(var(--spacing-unit) * 1) center",
              paddingRight: "calc(var(--spacing-unit) * 3)",
            }}
          >
            <option value="classic">Classic (3×3)</option>
            <option value="decay">Timed Decay</option>
            <option value="circles">Circle vs Circle</option>
            <option disabled>Ultra Tic Tac Toe (Coming soon)</option>
          </select>
          {/* Helper text */}
          {RULESET_DESCRIPTIONS[ruleset] && (
            <p
              className="text-body"
              style={{
                fontSize: "13px",
                color: "var(--color-text-secondary)",
                marginTop: "calc(var(--spacing-unit) * 0.5)",
                lineHeight: "1.4",
              }}
            >
              {RULESET_DESCRIPTIONS[ruleset]}
            </p>
          )}
        </div>

        {/* Illustration Area - Hidden for Timed Decay */}
        {ruleset !== "decay" && (
          <div
            style={{
              width: "100%",
              height: "120px",
              borderRadius: "var(--radius-card)",
              backgroundColor: "var(--color-surface)",
              border: "1px solid var(--color-border)",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              position: "relative",
              overflow: "hidden",
              gap: "8px",
            }}
          >
            {/* Simple bot illustration placeholder */}
            <div
              style={{
                display: "flex",
                gap: "calc(var(--spacing-unit) * 1.5)",
                alignItems: "center",
                opacity: 0.4,
              }}
            >
              {/* User icon */}
              <div
                style={{
                  width: "48px",
                  height: "48px",
                  borderRadius: "50%",
                  backgroundColor: "var(--color-text-secondary)",
                  opacity: 0.3,
                }}
              />
              {/* VS text */}
              <div
                className="text-body"
                style={{
                  fontSize: "14px",
                  fontWeight: 700,
                  color: "var(--color-text-secondary)",
                }}
              >
                VS
              </div>
              {/* Bot icon */}
              <div
                style={{
                  width: "48px",
                  height: "48px",
                  borderRadius: "12px",
                  backgroundColor: "var(--color-text-secondary)",
                  opacity: 0.3,
                }}
              />
            </div>
          </div>
        )}

        {/* Turns before decay slider - Only shown for decay ruleset */}
        {ruleset === "decay" && (
          <div>
            <label
              className="text-body"
              style={{
                display: "block",
                marginBottom: "calc(var(--spacing-unit) * 1.25)",
                color: "var(--color-text-secondary)",
                fontWeight: 600,
              }}
            >
              Turns before decay
            </label>

            {/* Slider container */}
            <div style={{ position: "relative", paddingTop: "16px", paddingBottom: "16px" }}>
              {/* Background track line connecting all steps */}
              <div
                style={{
                  position: "absolute",
                  top: "50%",
                  left: "0",
                  right: "0",
                  height: "2px",
                  backgroundColor: "#D1D1D1",
                  transform: "translateY(-50%)",
                  pointerEvents: "none",
                }}
              />

              {/* Step markers positioned at exact slider positions */}
              <div
                style={{
                  position: "absolute",
                  top: "50%",
                  left: "0",
                  right: "0",
                  transform: "translateY(-50%)",
                  pointerEvents: "none",
                }}
              >
                {[
                  { value: 4, position: 0 },
                  { value: 5, position: 33.33 },
                  { value: 6, position: 66.67 },
                  { value: 7, position: 100 },
                ].map(({ value, position }) => (
                  <div
                    key={value}
                    style={{
                      position: "absolute",
                      left: `${position}%`,
                      transform: "translate(-50%, -50%)",
                      top: "50%",
                      width: value === decayTurns ? "18px" : "8px",
                      height: value === decayTurns ? "18px" : "8px",
                      borderRadius: "50%",
                      backgroundColor: value === decayTurns ? "var(--color-primary-bg)" : "#D1D1D1",
                      transition: "all 0.2s ease",
                    }}
                  />
                ))}
              </div>

              {/* Range input slider */}
              <input
                type="range"
                min={4}
                max={7}
                step={1}
                value={decayTurns}
                onChange={(e) => setDecayTurns(Number(e.target.value))}
                style={{
                  position: "relative",
                  width: "100%",
                  height: "32px",
                  cursor: "pointer",
                  appearance: "none",
                  WebkitAppearance: "none",
                  backgroundColor: "transparent",
                  outline: "none",
                }}
                className="decay-slider"
              />
            </div>

            {/* Value labels */}
            <div
              style={{
                position: "relative",
                marginTop: "calc(var(--spacing-unit) * 0.5)",
                height: "24px",
              }}
            >
              {[
                { value: 4, position: 0 },
                { value: 5, position: 33.33 },
                { value: 6, position: 66.67 },
                { value: 7, position: 100 },
              ].map(({ value, position }) => (
                <button
                  key={value}
                  onClick={() => setDecayTurns(value)}
                  className="text-body"
                  style={{
                    position: "absolute",
                    left: `${position}%`,
                    transform: "translateX(-50%)",
                    fontSize: "14px",
                    fontWeight: value === decayTurns ? 700 : 500,
                    color: value === decayTurns ? "var(--color-text-primary)" : "var(--color-text-secondary)",
                    cursor: "pointer",
                    backgroundColor: "transparent",
                    border: "none",
                    padding: "calc(var(--spacing-unit) * 0.25)",
                    transition: "all 0.2s ease",
                    whiteSpace: "nowrap",
                  }}
                >
                  {value}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Difficulty Selector - Horizontal Cards (Bot mode only) */}
        {mode === "bot" && (
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
              gap: "calc(var(--spacing-unit) * 0.75)",
            }}
          >
            {/* Easy Card */}
            <button
              onClick={() => setDifficulty("easy")}
              className="text-button"
              style={{
                flex: 1,
                padding: "calc(var(--spacing-unit) * 0.875)",
                borderRadius: "var(--radius-button)",
                backgroundColor: "var(--color-surface)",
                cursor: "pointer",
                border: difficulty === "easy" ? "2px solid var(--color-x)" : "2px solid var(--color-border)",
                textAlign: "center",
                display: "flex",
                flexDirection: "column",
                gap: "6px",
                transition: "all 0.2s ease",
                boxShadow: difficulty === "easy" ? "0 2px 8px rgba(0, 0, 0, 0.08)" : "none",
              }}
            >
              <span
                style={{
                  fontWeight: 700,
                  fontSize: "15px",
                  color: difficulty === "easy" ? "var(--color-x)" : "var(--color-text-primary)",
                }}
              >
                Easy
              </span>
              <span
                style={{
                  fontSize: "11px",
                  color: "var(--color-text-secondary)",
                  fontWeight: 400,
                  lineHeight: "1.3",
                }}
              >
                Makes mistakes
              </span>
            </button>

            {/* Normal Card */}
            <button
              onClick={() => setDifficulty("normal")}
              className="text-button"
              style={{
                flex: 1,
                padding: "calc(var(--spacing-unit) * 0.875)",
                borderRadius: "var(--radius-button)",
                backgroundColor: "var(--color-surface)",
                cursor: "pointer",
                border: difficulty === "normal" ? "2px solid var(--color-text-primary)" : "2px solid var(--color-border)",
                textAlign: "center",
                display: "flex",
                flexDirection: "column",
                gap: "6px",
                transition: "all 0.2s ease",
                boxShadow: difficulty === "normal" ? "0 2px 8px rgba(0, 0, 0, 0.08)" : "none",
              }}
            >
              <span
                style={{
                  fontWeight: 700,
                  fontSize: "15px",
                  color: difficulty === "normal" ? "var(--color-text-primary)" : "var(--color-text-primary)",
                }}
              >
                Normal
              </span>
              <span
                style={{
                  fontSize: "11px",
                  color: "var(--color-text-secondary)",
                  fontWeight: 400,
                  lineHeight: "1.3",
                }}
              >
                Plays solid
              </span>
            </button>

            {/* Hard Card */}
            <button
              onClick={() => setDifficulty("hard")}
              className="text-button"
              style={{
                flex: 1,
                padding: "calc(var(--spacing-unit) * 0.875)",
                borderRadius: "var(--radius-button)",
                backgroundColor: "var(--color-surface)",
                cursor: "pointer",
                border: difficulty === "hard" ? "2px solid var(--color-o)" : "2px solid var(--color-border)",
                textAlign: "center",
                display: "flex",
                flexDirection: "column",
                gap: "6px",
                transition: "all 0.2s ease",
                boxShadow: difficulty === "hard" ? "0 2px 8px rgba(0, 0, 0, 0.08)" : "none",
              }}
            >
              <span
                style={{
                  fontWeight: 700,
                  fontSize: "15px",
                  color: difficulty === "hard" ? "var(--color-o)" : "var(--color-text-primary)",
                }}
              >
                Hard
              </span>
              <span
                style={{
                  fontSize: "11px",
                  color: "var(--color-text-secondary)",
                  fontWeight: 400,
                  lineHeight: "1.3",
                }}
              >
                Punishes errors
              </span>
            </button>
          </div>
        </div>
        )}

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
            marginTop: "calc(var(--spacing-unit) * 1)",
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
