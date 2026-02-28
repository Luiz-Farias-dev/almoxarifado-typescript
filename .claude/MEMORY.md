# Memory — D:\Projetos Programação

## Active Projects

- **almoxarifado-typescript** (backend): `D:\Projetos Programação\Node\almoxarifado-front-back\almoxarifado-typescript`
- **Almoxarifado-Frontend** (frontend): sibling of backend in the same monorepo
- See `almoxarifado-typescript/CLAUDE.md` for full project details (tech stack, routes, auth, folder conventions)

## almoxarifado-typescript — Test Setup (resolved)

- Framework: Jest 29 + ts-jest 29, config in `jest.config.ts` only (`jest.config.js` was removed)
- Tests live in `src/**/__tests__/**/*.test.ts`
- `tsconfig.json` must have `"jest"` in the `types` array (alongside `"node"`) for globals to resolve
- `jest.config.ts` uses `transform: { "^.+\\.ts$": ["ts-jest", { isolatedModules: true }] }` to suppress nodenext warning
- Run: `npm test -- --forceExit`

## Patterns & Pitfalls

### JWT error handling order
`TokenExpiredError` is a subclass of `JsonWebTokenError`. Always check the subclass **first**:
```ts
if (error instanceof jwt.TokenExpiredError) { ... }   // check first
if (error instanceof jwt.JsonWebTokenError) { ... }   // check second
```

### Zod nullable vs optional
`.optional()` allows the field to be absent but NOT `null`. For nullable DB fields use:
```ts
z.date().or(z.string()).nullable().optional()
```

### Zod response schema validation
Do not run Zod schema parsing on controller output (response side). Use Zod only for **input** validation (request body/params/query). Response schemas that require fields the DB mock doesn't return cause 500 errors in tests.

### Early return after res.status()
Always add `return` after sending a response in a non-async (`.then()`-chained) controller:
```ts
if (invalid) {
  res.status(400).json({ error: "..." });
  return; // prevent fall-through to .destroy()/.then() etc.
}
```

## User Preferences

- Commits in English, imperative style
- Prefers explicit explanation of each bug before fixing (TDD red-green-refactor workflow)
- Updates CLAUDE.md after sessions that resolve known issues
- Updates memory after significant sessions
