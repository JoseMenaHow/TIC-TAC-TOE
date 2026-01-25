import Modal from "./Modal";

interface ExitConfirmModalProps {
  onContinue: () => void;
  onQuit: () => void;
}

export default function ExitConfirmModal({ onContinue, onQuit }: ExitConfirmModalProps) {
  return (
    <Modal>
      <h2
        className="text-section"
        style={{
          marginBottom: "calc(var(--spacing-unit) / 2)",
        }}
      >
        Leave Game?
      </h2>
      <p
        className="text-body"
        style={{
          color: "var(--color-text-secondary)",
          marginBottom: "calc(var(--spacing-unit) * 2)",
        }}
      >
        Your progress will be lost.
      </p>
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "var(--spacing-unit)",
        }}
      >
        <button
          onClick={onContinue}
          className="text-button"
          style={{
            padding: "calc(var(--spacing-unit) * 0.75) calc(var(--spacing-unit) * 1.5)",
            borderRadius: "var(--radius-button)",
            backgroundColor: "var(--color-primary-bg)",
            color: "var(--color-primary-text)",
            cursor: "pointer",
          }}
        >
          Continue Playing
        </button>
        <button
          onClick={onQuit}
          className="text-button"
          style={{
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
