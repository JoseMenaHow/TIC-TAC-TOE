import { motion } from "framer-motion";
import { ReactNode } from "react";

interface ModalProps {
  children: ReactNode;
}

export default function Modal({ children }: ModalProps) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: "var(--color-overlay)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "var(--spacing-unit)",
        zIndex: 1000,
      }}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        transition={{ duration: 0.2 }}
        style={{
          backgroundColor: "var(--color-background)",
          borderRadius: "var(--radius-card)",
          padding: "var(--padding-card)",
          maxWidth: "400px",
          width: "100%",
          textAlign: "center",
        }}
      >
        {children}
      </motion.div>
    </motion.div>
  );
}
