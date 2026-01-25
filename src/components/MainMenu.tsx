import { motion } from "framer-motion";
import { GameConfig } from "../types/game";
import ModeCard from "./ModeCard";
import PeopleIcon from "../icons/PeopleIcon";
import BotIcon from "../icons/BotIcon";
import OnlineIcon from "../icons/OnlineIcon";

interface MainMenuProps {
  onStartGame: (config: GameConfig) => void;
}

export default function MainMenu({ onStartGame }: MainMenuProps) {
  const handleLocal1v1 = () => {
    onStartGame({
      mode: "local",
      gridSize: 3,
      winLength: 3,
    });
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
        position: "relative",
      }}
    >
      {/* ZONE 1: HEADER */}
      <div
        style={{
          width: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          paddingTop: "calc(var(--spacing-unit) * 4)",
          paddingBottom: "calc(var(--spacing-unit) * 2)",
          position: "relative",
        }}
      >
        {/* Decorative sparkles */}
        <div
          style={{
            position: "absolute",
            top: "24px",
            right: "24px",
            width: "12px",
            height: "12px",
            backgroundColor: "#E0E0E0",
            transform: "rotate(45deg)",
          }}
        />
        <div
          style={{
            position: "absolute",
            top: "80px",
            left: "16px",
            width: "8px",
            height: "8px",
            backgroundColor: "#E0E0E0",
            borderRadius: "50%",
          }}
        />

        {/* Logo row - 3 tiles with text */}
        <div
          style={{
            display: "flex",
            gap: "8px",
            marginBottom: "calc(var(--spacing-unit) * 1.5)",
          }}
        >
          {/* Tile 1: "Tic" in green */}
          <div
            style={{
              width: "60px",
              height: "60px",
              borderRadius: "var(--radius-cell)",
              backgroundColor: "var(--color-background)",
              border: "2px solid var(--color-border)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontWeight: 900,
              fontSize: "18px",
              color: "var(--color-x)",
            }}
          >
            Tic
          </div>

          {/* Tile 2: "Tac" in primary dark */}
          <div
            style={{
              width: "60px",
              height: "60px",
              borderRadius: "var(--radius-cell)",
              backgroundColor: "var(--color-background)",
              border: "2px solid var(--color-border)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontWeight: 900,
              fontSize: "18px",
              color: "var(--color-text-primary)",
            }}
          >
            Tac
          </div>

          {/* Tile 3: "Toe" in red */}
          <div
            style={{
              width: "60px",
              height: "60px",
              borderRadius: "var(--radius-cell)",
              backgroundColor: "var(--color-background)",
              border: "2px solid var(--color-border)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontWeight: 900,
              fontSize: "18px",
              color: "var(--color-o)",
            }}
          >
            Toe
          </div>
        </div>

        {/* Subtitle */}
        <div
          className="text-body"
          style={{
            color: "var(--color-text-secondary)",
            marginBottom: "calc(var(--spacing-unit) * 1.5)",
          }}
        >
          Game
        </div>

        {/* Header separator */}
        <div
          style={{
            width: "100%",
            height: "1px",
            backgroundColor: "var(--color-border)",
            opacity: 0.3,
          }}
        />
      </div>

      {/* ZONE 2: MODE SELECTION */}
      <div
        style={{
          width: "100%",
          backgroundColor: "var(--color-surface)",
          paddingTop: "calc(var(--spacing-unit) * 3)",
          paddingBottom: "calc(var(--spacing-unit) * 4)",
          borderTopLeftRadius: "var(--radius-card)",
          borderTopRightRadius: "var(--radius-card)",
          display: "flex",
          justifyContent: "center",
          flex: 1,
        }}
      >
        <div
          style={{
            width: "100%",
            maxWidth: "400px",
            display: "flex",
            flexDirection: "column",
            gap: "var(--spacing-unit)",
            padding: "0 var(--padding-screen-h)",
          }}
        >
          <ModeCard
            icon={<PeopleIcon size={32} />}
            label="Local 1v1"
            enabled={true}
            onClick={handleLocal1v1}
            delay={0.1}
          />
          <ModeCard
            icon={<BotIcon size={32} />}
            label="Vs Bot"
            enabled={false}
            delay={0.2}
          />
          <ModeCard
            icon={<OnlineIcon size={32} />}
            label="Online"
            enabled={false}
            delay={0.3}
          />
        </div>
      </div>
    </motion.div>
  );
}
