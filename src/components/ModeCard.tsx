import { motion } from "framer-motion";

interface ModeCardProps {
  icon: React.ReactNode;
  label: string;
  enabled: boolean;
  onClick?: () => void;
  delay?: number;
}

export default function ModeCard({ icon, label, enabled, onClick, delay = 0 }: ModeCardProps) {
  const CardContent = (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        height: "80px",
        borderRadius: "var(--radius-card)",
        backgroundColor: enabled ? "var(--color-primary-bg)" : "var(--color-disabled-surface)",
        color: enabled ? "var(--color-primary-text)" : "var(--color-disabled-text)",
        cursor: enabled ? "pointer" : "not-allowed",
        pointerEvents: enabled ? "auto" : "none",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Left icon region */}
      <div
        style={{
          width: "80px",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "flex-start",
          paddingLeft: "16px",
          flexShrink: 0,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", lineHeight: 1 }}>{icon}</div>
      </div>

      {/* Center label */}
      <div
        style={{
          flex: 1,
          textAlign: "center",
          paddingRight: "80px", // Balance the left icon space
        }}
      >
        <span className="text-section">{label}</span>
      </div>
    </div>
  );

  if (!enabled) {
    // Disabled card: no press animations
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay }}
      >
        {CardContent}
      </motion.div>
    );
  }

  // Enabled card: with press animation
  return (
    <motion.button
      onClick={onClick}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileTap={{ scale: 0.98 }}
      transition={{ duration: 0.4, delay }}
      style={{
        width: "100%",
        border: "none",
        padding: 0,
        background: "none",
      }}
    >
      {CardContent}
    </motion.button>
  );
}
