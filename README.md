# Tic Tac Toe

A minimal, mobile-first Tic Tac Toe web app built with React, TypeScript, Vite, and Framer Motion.

## Features

- **Local 1v1 gameplay** - Two players alternate turns on the same device
- **Clean, minimal UI** - Airy design with high whitespace and soft neutrals
- **Smooth animations** - Subtle transitions and interactions using Framer Motion
- **Win/Draw detection** - Automatic game-over detection with modal dialogs
- **Responsive design** - Mobile-first layout that works on all screen sizes
- **Future-ready** - Structured to support larger grids, bot play, and online multiplayer

## Tech Stack

- **React 18** - UI framework
- **TypeScript** - Type safety
- **Vite** - Fast build tool and dev server
- **Framer Motion** - Animation library
- **No backend** - Pure client-side application

## Getting Started

### Prerequisites

- Node.js (v18 or higher)
- npm or yarn

### Installation

1. Clone or navigate to this repository:
```bash
cd "TIC TAC TOE"
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

4. Open your browser to the URL shown (usually `http://localhost:5173`)

### Build for Production

```bash
npm run build
```

The production-ready files will be in the `dist/` directory.

### Preview Production Build

```bash
npm run preview
```

## Deployment to Vercel

### Option 1: Deploy via Vercel CLI

1. Install Vercel CLI (if not already installed):
```bash
npm install -g vercel
```

2. Deploy to Vercel:
```bash
vercel
```

3. Follow the prompts:
   - Set up and deploy? **Yes**
   - Which scope? (Select your account)
   - Link to existing project? **No**
   - Project name? (Press Enter for default or enter custom name)
   - In which directory is your code located? **./** (Press Enter)
   - Want to override settings? **No** (Vercel auto-detects Vite)

4. Your app will be deployed and you'll receive a URL like `https://your-project.vercel.app`

### Option 2: Deploy via Vercel Dashboard

1. Push your code to GitHub, GitLab, or Bitbucket

2. Go to [vercel.com](https://vercel.com) and sign in

3. Click **"Add New Project"**

4. Import your repository

5. Vercel will auto-detect the Vite configuration:
   - **Framework Preset:** Vite
   - **Build Command:** `vite build`
   - **Output Directory:** `dist`

6. Click **"Deploy"**

7. Your app will be live at your assigned Vercel URL

### Option 3: One-Click Deploy

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=YOUR_REPO_URL)

Replace `YOUR_REPO_URL` with your actual repository URL.

## Project Structure

```
src/
├── components/
│   ├── Cell.tsx              # Individual game cell
│   ├── DrawModal.tsx         # Draw game modal
│   ├── ExitConfirmModal.tsx  # Exit confirmation modal
│   ├── Game.tsx              # Game screen orchestrator
│   ├── GameBoard.tsx         # 3×3 grid of cells
│   ├── MainMenu.tsx          # Main menu screen
│   ├── Modal.tsx             # Reusable modal wrapper
│   ├── ModeCard.tsx          # Mode selection card
│   ├── TurnIndicator.tsx     # Turn number and player indicator
│   └── WinModal.tsx          # Win announcement modal
├── types/
│   └── game.ts               # TypeScript type definitions
├── utils/
│   └── gameLogic.ts          # Win/draw detection logic
├── App.tsx                   # Main app with navigation
├── index.css                 # Global styles and design tokens
└── main.tsx                  # Entry point
```

## How to Play

1. **Main Menu** - Click "Local 1v1" to start a game
2. **Game Play** - Players alternate tapping cells to place X or O marks
3. **Winning** - Get three in a row (horizontal, vertical, or diagonal) to win
4. **Draw** - If all 9 cells are filled with no winner, it's a draw
5. **Play Again** - Click "Play Again" to start a new game
6. **Quit** - Click "Quit" to return to the main menu

## Future Enhancements

The codebase is structured to support:
- **Larger grids** - 4×4, 9×9 boards with configurable win lengths
- **Vs Bot mode** - AI opponent with difficulty levels
- **Online multiplayer** - Real-time play with other users

## License

MIT
