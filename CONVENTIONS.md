# Code Conventions

## Text in Code
**IMPORTANT: Use English ONLY for all UI text and user-facing strings in code**

### Rules:
- Button labels: "NEW GAME", "PLAY", "RESET", etc.
- Error messages: English only
- UI labels and headers: English only
- Game over screens: English only
- Dialogs and alerts: English only

### Allowed exceptions:
- Code comments can be in any language (but prefer English for consistency)
- Internal variable/function names: Always English

### Examples:
✅ CORRECT:
```typescript
<button>NEW GAME</button>
<h1>GAME OVER</h1>
```

❌ INCORRECT:
```typescript
<button>Играть снова</button>  // Don't use Russian/other languages
<h1>ИГРА ОКОНЧЕНА</h1>
```

This applies to ALL games in the AIgames project.
