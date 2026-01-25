import Modal from "./Modal";
import DotIcon from "../icons/DotIcon";

interface DrawModalProps {
  onPlayAgain: () => void;
  onQuit: () => void;
}

export default function DrawModal({ onPlayAgain, onQuit }: DrawModalProps) {
  return (
    <Modal>
      {/* Icon - Neutral gray dot */}
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          paddingTop: "8px",
          paddingBottom: "16px",
          color: "var(--color-text-secondary)",
          opacity: 0.5,
        }}
      >
        <DotIcon size={10} />
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
        It's a tie!
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
        We're all winners here…{"\n"}Or we both suck.
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
