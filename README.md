# AI Games

Browser-based games created by AI for quick development and testing.

## Stack

- **Vite** - Ultra-fast build tool
- **React 18** - UI components
- **TypeScript** - Type-safe development
- **Tailwind CSS** - Rapid styling
- **Effector** - Event-driven state management
- **Canvas API** - Game rendering
- **Vitest** - Unit testing
- **PWA Ready** - Installable, offline-capable

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn

### Installation

```bash
npm install
```

### Development

```bash
npm run dev
```

Opens browser at `http://localhost:5173`

### Build

```bash
npm run build
```

Creates optimized production build in `dist/`

### Testing

```bash
npm run test        # Run tests
npm run test:ui    # Run tests with UI
```

## Deployment

### Deploy to Vercel (Recommended)

1. **One-time setup:**
   ```bash
   npx vercel
   ```
   Follow the prompts to connect your GitHub repo to Vercel.

2. **Auto-deploy on git push:**
   - Push to `main` branch
   - Vercel automatically builds and deploys
   - Get a live URL instantly

3. **Manual deployment:**
   ```bash
   npx vercel --prod
   ```

### GitHub Actions (Auto-Deploy)

For automatic deployment on every push, configure GitHub secrets:

1. Go to your repo → Settings → Secrets and variables → Actions
2. Add these secrets:
   - `VERCEL_TOKEN` - Get from https://vercel.com/account/tokens
   - `VERCEL_ORG_ID` - Found in Vercel account settings
   - `VERCEL_PROJECT_ID` - Found in project settings

The workflow file `.github/workflows/deploy.yml` is already configured.

## Project Structure

```
src/
├── components/          # React components (UI)
├── store/              # Effector stores (state management)
├── hooks/              # Custom React hooks
├── utils/              # Utility functions
├── types/              # TypeScript types
├── App.tsx             # Root component
├── main.tsx            # Entry point
└── index.css           # Global styles
public/
├── index.html          # HTML template
└── manifest.json       # PWA manifest
```

## Game Development Tips

### Rendering

Use Canvas API for game graphics in a React component:

```tsx
const GameCanvas: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    // Game rendering logic
  }, []);

  return <canvas ref={canvasRef} width={800} height={600} />;
};
```

### State Management

Use Effector stores for game logic:

```ts
import { createStore, createEvent } from "effector";

export const scoreUpdated = createEvent<number>();
export const $score = createStore(0).on(scoreUpdated, (_, score) => score);
```

### UI Components

Use React for menus, HUD, and overlays:

```tsx
import { useStore } from "effector-react";

const HUD: React.FC = () => {
  const score = useStore($score);
  return <div>Score: {score}</div>;
};
```

## PWA Features

This app is PWA-ready:

- ✅ Installable on home screen (mobile & desktop)
- ✅ Offline gameplay support
- ✅ Auto-updating Service Worker
- ✅ Native app-like experience

## License

MIT
