import { motion } from "framer-motion";
import { CellValue } from "../types/game";
import XIcon from "../icons/XIcon";
import OIcon from "../icons/OIcon";

interface CellProps {
  value: CellValue;
  onClick: () => void;
  isWinningCell: boolean;
  isLastMove: boolean;
}

export default function Cell({ value, onClick, isWinningCell, isLastMove }: CellProps) {
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
          animate={{ opacity: 1 }}
          transition={{ duration: 0.08 }}
          style={{ display: "flex", alignItems: "center", justifyContent: "center" }}
        >
          {value === "X" ? <XIcon size={48} /> : <OIcon size={48} />}
        </motion.div>
      )}
    </motion.button>
  );
}
