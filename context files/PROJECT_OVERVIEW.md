# CodeCollab — Interactive Code Collaboration & Learning Platform

> **Master Context Document for AI Agent Development**

## What This Project Is

CodeCollab is a browser-native IDE platform built on the **MERN stack** (MongoDB, Express.js, React/Vite, Node.js) that unifies interactive video education with structured real-time pair programming. It has two core modes:

1. **Learning Mode** — Video lectures with time-synced code playback. Students can pause, fork into a sandbox, experiment, and resume.
2. **Pair Programming Mode** — Role-enforced collaboration (Driver/Navigator) with isolated scratchpads, real-time snippet sharing, and Ghost Merge proposals.

---

## Critical Design & UX Requirements

### Visual Identity
- **Dark background** throughout the entire application (deep charcoal/navy, NOT pure black)
- **Minimal, clean UI** — inspired by modern developer tools (Hexa CLI website aesthetic)
- Subtle **motion/animations** (framer-motion or GSAP) — smooth page transitions, hover effects, micro-interactions
- **No visual clutter** — generous whitespace, clear hierarchy, muted accent colors against dark surfaces
- Typography: Use `Inter` or `JetBrains Mono` (for code) from Google Fonts

### IDE Component — MUST Resemble VS Code
- Use **Monaco Editor** (`@monaco-editor/react`) — the exact engine powering VS Code
- The editor panel MUST visually resemble VS Code:
  - Dark theme (VS Code Dark+ or One Dark Pro palette)
  - File/tab bar at the top of the editor area
  - Line numbers, minimap toggle, bracket matching
  - Syntax highlighting for C, C++, Java, Python, JavaScript

### Scratchpad Tab Switching — MUST Resemble VS Code Tabs
- In Pair Programming Mode, when viewing other participants' scratchpads, the UX **MUST** use a **tab bar identical to VS Code's file tab bar** at the top of the scratchpad viewer panel
- Each participant's scratchpad = one tab, labeled with their username/avatar
- Clicking a tab switches the read-only view to that user's live scratchpad
- Active tab is highlighted, inactive tabs are dimmed (exactly like VS Code)
- Tabs should support horizontal scrolling if there are many participants

---

## Tech Stack (Strict)

| Layer | Technology | Notes |
|-------|-----------|-------|
| Frontend Framework | React 18+ with Vite | No CRA, no Next.js |
| State Management | Redux Toolkit + RTK Query | For complex global state |
| Code Editor | Monaco Editor (`@monaco-editor/react`) | VS Code engine |
| Real-Time | Socket.io (client + server) | WebSocket transport |
| Styling | Vanilla CSS + CSS Modules | Dark theme variables |
| Animations | Framer Motion | Subtle, performant |
| Video Player | React Player or custom HTML5 | For learning mode |
| Backend | Node.js + Express.js | REST + Socket.io |
| Database | MongoDB + Mongoose | Document-based schemas |
| Code Execution | Piston API (external) | Sandboxed containers |
| JS Execution | Web Workers (in-browser) | Zero-latency JS runs |
| Auth | JWT + bcrypt | Optional Google OAuth |

---

## Project Structure (Monorepo)

```
codecollab/
├── client/                    # React + Vite frontend
│   ├── public/
│   ├── src/
│   │   ├── assets/            # Images, fonts, icons
│   │   ├── components/        # Reusable UI components
│   │   │   ├── Editor/        # Monaco editor wrapper
│   │   │   ├── Terminal/      # Output terminal panel
│   │   │   ├── VideoPlayer/   # Learning mode video
│   │   │   ├── TabBar/        # VS Code-style tab bar
│   │   │   ├── Scratchpad/    # Navigator scratchpad
│   │   │   ├── GhostMerge/    # Diff proposal overlay
│   │   │   ├── Comments/      # Block commenting threads
│   │   │   └── Layout/        # Shell, sidebar, split panes
│   │   ├── pages/
│   │   │   ├── Home/          # Landing page
│   │   │   ├── Room/          # Pair programming room
│   │   │   ├── Lecture/       # Learning mode view
│   │   │   └── Dashboard/     # User dashboard
│   │   ├── store/             # Redux slices
│   │   ├── hooks/             # Custom React hooks
│   │   ├── services/          # API + socket services
│   │   ├── utils/             # Helpers, constants
│   │   ├── styles/            # Global CSS, variables, themes
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── index.html
│   ├── vite.config.js
│   └── package.json
├── server/                    # Express + Socket.io backend
│   ├── config/                # DB config, env loader
│   ├── controllers/           # Route handlers
│   ├── middleware/             # Auth, error handling
│   ├── models/                # Mongoose schemas
│   ├── routes/                # Express route definitions
│   ├── sockets/               # Socket.io event handlers
│   │   ├── roomHandler.js     # Pair programming logic
│   │   ├── lectureHandler.js  # Learning mode sync
│   │   └── index.js           # Socket initialization
│   ├── services/              # Business logic, Piston API
│   ├── utils/                 # Helpers
│   ├── server.js              # Entry point
│   └── package.json
├── .env.example
├── .gitignore
├── README.md
└── package.json               # Root scripts (concurrently)
```

---

## Key Rules for the AI Agent

1. **Never use TailwindCSS.** Use vanilla CSS with CSS custom properties for theming.
2. **Never use Create React App.** Use Vite exclusively.
3. **Always use the dark theme.** Every component must use CSS variables from the theme.
4. **Monaco Editor is non-negotiable.** Do not substitute with CodeMirror or Ace.
5. **Scratchpad tab switching MUST look like VS Code tabs.** Not a dropdown, not a sidebar list — a horizontal tab bar at the top.
6. **Socket.io events must be lightweight.** Send operational transforms / deltas, NOT full document state.
7. **Code execution goes through Piston API.** Never execute user code on the Express server directly.
8. **JavaScript execution can use Web Workers** for zero-latency browser-side execution.
9. **All components must be modular.** One component per file, clear separation of concerns.
10. **Every page must have SEO meta tags** — title, description, Open Graph.

---

## Development Order (Phased)

### Phase 1: Foundation
- Project scaffolding (Vite + Express monorepo)
- Design system (CSS variables, dark theme, typography)
- Layout shell (header, sidebar, main content, split panes)
- Monaco editor integration (basic standalone)

### Phase 2: Pair Programming Mode
- Room creation & UUID sharing
- Socket.io room join/leave
- Driver/Navigator role enforcement
- Real-time keystroke broadcasting
- Scratchpad system with VS Code-style tab switching
- Ghost Merge (propose/accept diffs)
- Role swap mechanism

### Phase 3: Code Execution
- Piston API integration
- Terminal output panel
- Multi-language support (C, C++, Java, Python, JS)
- Web Worker JS execution

### Phase 4: Learning Mode
- Video player with timestamp tracking
- Instructor recording: keystroke logging against timestamps
- Time-travel code sync (auto-typing to match video)
- Pause-and-fork sandbox
- Resume with state revert

### Phase 5: Polish
- Block commenting system
- Landing page with animations
- Dashboard/profile
- Responsive layout for smaller screens
- Error handling, loading states, edge cases

---

## Reference Images

The attached images show the desired aesthetic:
- **Dark background** with subtle gradients
- **Monospace terminal-style** hero sections
- **Minimal navigation** bars
- **Clean card/panel** layouts with soft borders
- **Muted accent colors** (teal, purple, soft blue) against dark surfaces

The overall feel should be: **developer-tool premium, not flashy consumer app**.
