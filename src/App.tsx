import { useState } from "react";
import { AnimatePresence } from "framer-motion";
import { GameConfig } from "./types/game";
import MainMenu from "./components/MainMenu";
import Game from "./components/Game";

type Screen = "menu" | "game";

function App() {
  const [currentScreen, setCurrentScreen] = useState<Screen>("menu");
  const [gameConfig, setGameConfig] = useState<GameConfig>({
    mode: "local",
    gridSize: 3,
    winLength: 3,
  });

  const navigateToGame = (config: GameConfig) => {
    setGameConfig(config);
    setCurrentScreen("game");
  };

  const navigateToMenu = () => {
    setCurrentScreen("menu");
  };

  return (
    <AnimatePresence mode="wait">
      {currentScreen === "menu" && (
        <MainMenu key="menu" onStartGame={navigateToGame} />
      )}
      {currentScreen === "game" && (
        <Game key="game" config={gameConfig} onBack={navigateToMenu} />
      )}
    </AnimatePresence>
  );
}

export default App;
