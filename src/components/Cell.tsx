import { motion } from "framer-motion";
import { CellValue, Circle } from "../types/game";
import XIcon from "../icons/XIcon";
import OIcon from "../icons/OIcon";

interface CellProps {
  value: CellValue;
  onClick: () => void;
  isWinningCell: boolean;
  isLastMove: boolean;
  isExpiring: boolean;
  cellStack?: Circle[]; // For circles ruleset
}

export default function Cell({ value, onClick, isWinningCell, isLastMove, isExpiring, cellStack }: CellProps) {
  // Render circles ruleset with stacking visualization
  if (cellStack !== undefined) {
    const stack = cellStack ?? [];
    const len = stack.length;

    const top = len > 0 ? stack[len - 1] : null;
    const under1 = len > 1 ? stack[len - 2] : null;
    const under2 = len > 2 ? stack[len - 3] : null;

    const getSizePx = (size: 1 | 2 | 3) => {
      if (size === 1) return 32;
      if (size === 2) return 52;
      return 72;
    };

    const getSizeLabel = (size: 1 | 2 | 3) => {
      if (size === 1) return "S";
      if (size === 2) return "M";
      return "L";
    };

    return (
      <motion.button
        onClick={onClick}
        animate={
          isLastMove && top
            ? { scale: [1, 0.95, 1] }
            : { scale: 1 }
        }
        transition={{
          duration: 0.28,
          times: [0, 0.36, 1],
          ease: [0.6, 0.04, 0.38, 0.96],
        }}
        style={{
          width: "100%",
          aspectRatio: "1",
          minHeight: "80px",
          backgroundColor: "var(--color-surface-subtle)",
          borderRadius: "var(--radius-cell)",
          border: "none",
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          position: "relative",
          overflow: "visible",
        }}
      >
        {/* Under ring 2 (deepest) */}
        {under2 && (
          <div
            style={{
              position: "absolute",
              width: `${getSizePx(under2.size) - 6}px`,
              height: `${getSizePx(under2.size) - 6}px`,
              borderRadius: "9999px",
              border: "2px solid",
              borderColor: under2.owner === "X" ? "var(--color-x)" : "var(--color-o)",
              opacity: 0.12,
              pointerEvents: "none",
            }}
          />
        )}

        {/* Under ring 1 */}
        {under1 && (
          <div
            style={{
              position: "absolute",
              width: `${getSizePx(under1.size) - 3}px`,
              height: `${getSizePx(under1.size) - 3}px`,
              borderRadius: "9999px",
              border: "2px solid",
              borderColor: under1.owner === "X" ? "var(--color-x)" : "var(--color-o)",
              opacity: 0.25,
              pointerEvents: "none",
            }}
          />
        )}

        {/* Top circle (main) */}
        {top && (
          <motion.div
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: isLastMove ? [0.5, 1.05, 1] : 1 }}
            transition={{
              duration: 0.3,
              ease: "easeOut",
            }}
            style={{
              width: `${getSizePx(top.size)}px`,
              height: `${getSizePx(top.size)}px`,
              borderRadius: "9999px",
              backgroundColor: top.owner === "X" ? "var(--color-x)" : "var(--color-o)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "white",
              fontSize: `${top.size === 1 ? 14 : top.size === 2 ? 20 : 28}px`,
              fontWeight: 700,
              boxShadow: "0 2px 8px rgba(0, 0, 0, 0.15)",
              position: "relative",
              zIndex: 1,
            }}
          >
            {getSizeLabel(top.size)}
          </motion.div>
        )}
      </motion.button>
    );
  }

  // Render classic/decay ruleset
  return (
    <motion.button
      onClick={onClick}
      disabled={value !== null}
      animate={
        isLastMove && value
          ? { scale: [1, 0.90, 1] }
          : { scale: 1 }
      }
      transition={{
        duration: 0.28,
        times: [0, 0.36, 1],
        ease: [0.6, 0.04, 0.38, 0.96],
      }}
      style={{
        width: "100%",
        aspectRatio: "1",
        minHeight: "80px",
        backgroundColor: "var(--color-surface-subtle)",
        borderRadius: "var(--radius-cell)",
        border: "none",
        cursor: value === null ? "pointer" : "default",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: "48px",
        fontWeight: 900,
        color: value === "X" ? "var(--color-x)" : "var(--color-o)",
        opacity: isWinningCell ? 1 : value ? 0.9 : 1,
      }}
    >
      {value && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={
            isExpiring
              ? { opacity: 0, scale: 0.9 }
              : { opacity: 1, scale: 1 }
          }
          transition={{
            duration: isExpiring ? 0.18 : 0.08,
            ease: "easeOut",
          }}
          style={{ display: "flex", alignItems: "center", justifyContent: "center" }}
        >
          {value === "X" ? <XIcon size={48} /> : <OIcon size={48} />}
        </motion.div>
      )}
    </motion.button>
  );
}
