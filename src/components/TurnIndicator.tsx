import { Player } from "../types/game";
import XIcon from "../icons/XIcon";
import OIcon from "../icons/OIcon";
import DotIcon from "../icons/DotIcon";

interface TurnIndicatorProps {
  turnNumber: number;
  currentPlayer: Player;
}

export default function TurnIndicator({ turnNumber, currentPlayer }: TurnIndicatorProps) {
  // Determine which side shows the active player icon
  // Odd turns (1, 3, 5...): X on left
  // Even turns (2, 4, 6...): O on right
  const showActiveOnLeft = turnNumber % 2 === 1;

  const NeutralDot = () => (
    <div style={{ opacity: 0.5, color: "var(--color-text-secondary)", display: "flex" }}>
      <DotIcon size={8} />
    </div>
  );

  const ActiveIcon = ({ player }: { player: Player }) => (
    <div
      style={{
        color: player === "X" ? "var(--color-x)" : "var(--color-o)",
        display: "flex",
        alignItems: "center",
      }}
    >
      {player === "X" ? <XIcon size={20} /> : <OIcon size={20} />}
    </div>
  );

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: "12px",
        padding: "12px 24px",
        borderRadius: "var(--radius-cell)",
        backgroundColor: "var(--color-background)",
        border: "2px solid var(--color-border)",
      }}
    >
      {/* Left icon */}
      {showActiveOnLeft ? <ActiveIcon player={currentPlayer} /> : <NeutralDot />}

      {/* Center text */}
      <span className="text-body" style={{ color: "var(--color-text-secondary)" }}>
        Turn {turnNumber}
      </span>

      {/* Right icon */}
      {showActiveOnLeft ? <NeutralDot /> : <ActiveIcon player={currentPlayer} />}
    </div>
  );
}
