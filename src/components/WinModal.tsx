import { Player } from "../types/game";
import Modal from "./Modal";
import XIcon from "../icons/XIcon";
import OIcon from "../icons/OIcon";

interface WinModalProps {
  winner: Player;
  onPlayAgain: () => void;
  onQuit: () => void;
}

export default function WinModal({ winner, onPlayAgain, onQuit }: WinModalProps) {
  const winnerColor = winner === "X" ? "var(--color-x)" : "var(--color-o)";
  const playerNumber = winner === "X" ? 1 : 2;
  const bodyText = winner === "X"
    ? "Congratulations you crossed\nthe competition."
    : "Congratulations you drew circles\nagainst the competition.";

  return (
    <Modal>
      {/* Icon */}
      <div
        style={{
          color: winnerColor,
          marginBottom: "20px",
          display: "flex",
          justifyContent: "center",
        }}
      >
        {winner === "X" ? <XIcon size={64} /> : <OIcon size={64} />}
      </div>

      {/* Title */}
      <h2
        className="text-section"
        style={{
          fontSize: "22px",
          fontWeight: 900,
          marginBottom: "8px",
        }}
      >
        Player {playerNumber} won!
      </h2>

      {/* Body */}
      <p
        className="text-body"
        style={{
          color: "var(--color-text-secondary)",
          marginBottom: "calc(var(--spacing-unit) * 3)",
          whiteSpace: "pre-line",
          textAlign: "center",
        }}
      >
        {bodyText}
      </p>

      {/* Buttons */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "calc(var(--spacing-unit) * 0.75)",
          width: "100%",
        }}
      >
        <button
          onClick={onPlayAgain}
          className="text-button"
          style={{
            width: "100%",
            padding: "calc(var(--spacing-unit) * 0.75) calc(var(--spacing-unit) * 1.5)",
            borderRadius: "var(--radius-button)",
            backgroundColor: "var(--color-primary-bg)",
            color: "var(--color-primary-text)",
            cursor: "pointer",
          }}
        >
          Play Again
        </button>
        <button
          onClick={onQuit}
          className="text-button"
          style={{
            width: "100%",
            padding: "calc(var(--spacing-unit) * 0.75)",
            backgroundColor: "transparent",
            color: "var(--color-text-secondary)",
            cursor: "pointer",
          }}
        >
          Quit
        </button>
      </div>
    </Modal>
  );
}
