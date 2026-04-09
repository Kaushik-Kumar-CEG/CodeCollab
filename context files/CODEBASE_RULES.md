# Codebase Rules & Conventions

## File & Folder Naming
- **Folders**: `camelCase` (e.g., `ghostMerge/`, `codeEditor/`)
- **React Components**: `PascalCase.jsx` (e.g., `ScratchpadTabBar.jsx`)
- **Utilities/Services**: `camelCase.js` (e.g., `pistonService.js`)
- **CSS Modules**: `ComponentName.module.css` (e.g., `TabBar.module.css`)
- **Redux Slices**: `featureSlice.js` (e.g., `roomSlice.js`)
- **Socket Handlers**: `featureHandler.js` (e.g., `roomHandler.js`)

## Component Structure
Every React component file follows this structure:
```jsx
// 1. Imports (React, libraries, components, hooks, styles)
import { useState } from 'react';
import styles from './ComponentName.module.css';

// 2. Component definition (named export, arrow function)
export const ComponentName = ({ prop1, prop2 }) => {
  // 3. Hooks first
  const [state, setState] = useState(null);
  
  // 4. Handlers
  const handleClick = () => { /* ... */ };
  
  // 5. Render
  return (
    <div className={styles.container}>
      {/* JSX */}
    </div>
  );
};
```

**Rules:**
- One component per file
- Named exports only (no `export default`)
- Props destructured in function signature
- CSS Modules for styling (no inline styles except dynamic values)

## Redux Conventions
```javascript
// store/roomSlice.js
import { createSlice } from '@reduxjs/toolkit';

const roomSlice = createSlice({
  name: 'room',
  initialState: { /* typed initial state */ },
  reducers: {
    setParticipants: (state, action) => { /* ... */ },
    updateRole: (state, action) => { /* ... */ },
  },
});

export const { setParticipants, updateRole } = roomSlice.actions;
export default roomSlice.reducer;
```

- Slice per feature: `roomSlice`, `editorSlice`, `lectureSlice`, `executionSlice`
- Use RTK Query for REST API calls
- Socket events dispatch Redux actions via middleware

## Socket.io Conventions
- Event names: `namespace:action` format (e.g., `code:delta`, `ghost:propose`)
- Always validate payloads on server before processing
- Send deltas, NOT full document state
- Wrap handlers in try/catch with error emission

## CSS Rules
- **Always use CSS custom properties** from `UI_GUIDELINES.md`
- **Never use TailwindCSS**
- Use CSS Modules for component-scoped styles
- Global styles only in `styles/global.css` and `styles/variables.css`
- Dark theme is the ONLY theme (no light mode toggle needed)

## Error Handling
- Backend: Express error middleware returns `{ error: string, status: number }`
- Frontend: Toast notifications for user-facing errors
- Socket: `error` event emitted back to client on failure
- Never expose stack traces in production

## Git Conventions
- Branch naming: `feature/feature-name`, `fix/bug-description`
- Commit format: `feat: add scratchpad tab bar`, `fix: role swap race condition`
- No commits with `console.log` or TODO comments in production code

## Environment
- Development: `npm run dev` starts both client (Vite) and server (nodemon) via `concurrently`
- Client runs on port `5173`, server on port `5000`
- `.env` file never committed (use `.env.example` template)
