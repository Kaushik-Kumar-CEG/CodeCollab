---
description: How to develop features for the CodeCollab platform
---

# Development Workflow

## Prerequisites
- Node.js 18+ installed
- MongoDB Atlas connection string (or local MongoDB)
- All `.md` documentation files in project root read by the agent

## Starting Development

// turbo-all

### 1. Initial Setup (if not done)
```bash
# In project root
npm init -y
npm install concurrently
```

### 2. Scaffold Client
```bash
npx -y create-vite@latest client -- --template react
cd client
npm install @monaco-editor/react socket.io-client @reduxjs/toolkit react-redux react-router-dom framer-motion react-player
npm install -D vite
```

### 3. Scaffold Server
```bash
mkdir server && cd server
npm init -y
npm install express socket.io mongoose cors dotenv uuid bcryptjs jsonwebtoken
npm install -D nodemon
```

### 4. Run Dev Environment
```bash
# From project root — starts both client and server
npm run dev
```
This runs `concurrently "cd client && npm run dev" "cd server && npm run dev"`.

## Feature Development Process

When building a feature:

1. **Read the spec** — Check `FEATURE_SPECS.md` for acceptance criteria
2. **Check architecture** — Reference `ARCHITECTURE.md` for schemas, socket events, API routes
3. **Follow UI guidelines** — Use CSS variables from `UI_GUIDELINES.md`, dark theme only
4. **Follow code rules** — Component structure, naming from `CODEBASE_RULES.md`
5. **Build order**:
   - Backend model/route/socket handler first
   - Then Redux slice
   - Then React component with CSS Module
   - Then wire up socket/API calls
6. **Test** — Run the dev server and verify in browser

## Key Reminders
- Never use TailwindCSS
- Monaco Editor only (no CodeMirror/Ace)
- Scratchpad tabs MUST look like VS Code tabs
- Send Socket.io deltas, not full documents
- Code execution via Piston API, never on Express server
- JS execution via Web Workers for zero latency
