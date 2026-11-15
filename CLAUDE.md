# AIgames

Браузерные игры: React + TypeScript + Vite, состояние — effector, стили —
Tailwind (+ компоненты из `components.json`), тесты — Vitest.

Сначала `README.md` и `CONVENTIONS.md` (весь текст интерфейса — только
английский).

Команды: `npm run dev`, `npm run build` (tsc + vite), `npm test`,
`npm run lint`.

## Агенты и состояние

- Общие правила, агенты и хуки — в `~/projects/CLAUDE.md` и `~/projects/.claude/`.
- Файл состояния — `docs/ROADMAP.md` (создать при первой записи).
- Задачи агентам: `react-implementer` — `src/` (логику игры держать в
  effector-сторах и `lib/`, покрывать тестами); `backend-verifier` — тесты,
  lint, build; `frontend-verifier` — сыграть сценарий, ширины 1280 и 390px.
