# UI/UX Design Guidelines

## Design Philosophy

**"Developer-tool premium, not flashy consumer app."**

The interface must feel like a modern, polished developer tool — think VS Code, Linear, Vercel Dashboard, or Raycast. Dark, minimal, purposeful. Every element earns its place.

---

## Color System (CSS Custom Properties)

```css
:root {
  /* ── Background Layers (darkest → lightest) ── */
  --bg-base:       #0d1117;   /* App background */
  --bg-surface:    #161b22;   /* Cards, panels, sidebar */
  --bg-elevated:   #1c2128;   /* Modals, dropdowns, hover states */
  --bg-overlay:    #21262d;   /* Overlays, tooltips */
  
  /* ── Editor (VS Code Dark+ inspired) ── */
  --editor-bg:     #1e1e1e;   /* Monaco editor background */
  --editor-gutter: #1e1e1e;   /* Line number gutter */
  --editor-line:   #264f78;   /* Active line highlight */
  --editor-selection: #264f78;
  
  /* ── Text ── */
  --text-primary:   #e6edf3;  /* Main text, headings */
  --text-secondary: #8b949e;  /* Descriptions, labels */
  --text-muted:     #484f58;  /* Disabled, placeholder */
  --text-link:      #58a6ff;  /* Links, interactive text */
  
  /* ── Accent Colors ── */
  --accent-primary:   #58a6ff; /* Primary actions, focus rings */
  --accent-success:   #3fb950; /* Accept, success, online */
  --accent-warning:   #d29922; /* Warnings, pending */
  --accent-error:     #f85149; /* Errors, destructive */
  --accent-purple:    #bc8cff; /* Special highlights, tags */
  --accent-teal:      #39d353; /* Secondary accent */
  
  /* ── Borders ── */
  --border-default:  #30363d;  /* Standard borders */
  --border-muted:    #21262d;  /* Subtle dividers */
  --border-focus:    #58a6ff;  /* Focus rings */
  
  /* ── Shadows ── */
  --shadow-sm:  0 1px 2px rgba(0, 0, 0, 0.3);
  --shadow-md:  0 4px 12px rgba(0, 0, 0, 0.4);
  --shadow-lg:  0 8px 24px rgba(0, 0, 0, 0.5);
  --shadow-glow: 0 0 20px rgba(88, 166, 255, 0.15);
  
  /* ── Typography ── */
  --font-sans:  'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
  --font-mono:  'JetBrains Mono', 'Fira Code', 'Cascadia Code', monospace;
  
  --text-xs:    0.75rem;    /* 12px */
  --text-sm:    0.875rem;   /* 14px */
  --text-base:  1rem;       /* 16px */
  --text-lg:    1.125rem;   /* 18px */
  --text-xl:    1.25rem;    /* 20px */
  --text-2xl:   1.5rem;     /* 24px */
  --text-3xl:   2rem;       /* 32px */
  
  /* ── Spacing ── */
  --space-1: 4px;
  --space-2: 8px;
  --space-3: 12px;
  --space-4: 16px;
  --space-5: 20px;
  --space-6: 24px;
  --space-8: 32px;
  --space-10: 40px;
  --space-12: 48px;
  --space-16: 64px;
  
  /* ── Radius ── */
  --radius-sm:  4px;
  --radius-md:  6px;
  --radius-lg:  8px;
  --radius-xl:  12px;
  --radius-full: 9999px;
  
  /* ── Transitions ── */
  --transition-fast:   150ms ease;
  --transition-normal: 250ms ease;
  --transition-slow:   400ms ease;
}
```

---

## Typography Rules

1. **Body text**: `Inter` at `--text-sm` (14px) with `line-height: 1.6`
2. **Code / Editor**: `JetBrains Mono` at `14px` with `line-height: 1.5`
3. **Headings**: `Inter` semi-bold (600), use `--text-xl` to `--text-3xl`
4. **Labels / Captions**: `Inter` at `--text-xs` (12px) with `text-transform: uppercase`, `letter-spacing: 0.05em`
5. **NEVER use browser default fonts.** Always import from Google Fonts.

```html
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet">
```

---

## Component Design Specifications

### 1. VS Code-Style Tab Bar (CRITICAL)

This component is used in TWO places:
- File tabs in the main editor (future multi-file support)
- **Scratchpad viewer tabs** in Pair Programming mode (showing each navigator's scratchpad)

```
┌────────────┬────────────┬────────────┬─────────────────────────┐
│ ● Alice    │   Bob      │   Charlie  │                         │
│  (active)  │            │            │     (empty space)       │
├────────────┴────────────┴────────────┴─────────────────────────┤
│                                                                │
│  // Read-only view of selected user's scratchpad               │
│  function helper() {                                           │
│    return "proposed code";                                     │
│  }                                                             │
│                                                                │
└────────────────────────────────────────────────────────────────┘
```

**Visual specs:**
- Tab height: `35px`
- Tab background (active): `var(--editor-bg)` (#1e1e1e)
- Tab background (inactive): `var(--bg-surface)` (#161b22)
- Tab text (active): `var(--text-primary)` white
- Tab text (inactive): `var(--text-secondary)` gray
- Active tab has NO bottom border (merges with editor below)
- Inactive tabs have a `1px solid var(--border-default)` bottom border
- Tab bar background: `var(--bg-elevated)` (#1c2128)
- Each tab shows a colored dot (user's assigned color) + username
- Close button (×) appears on hover for each tab
- Tabs horizontally scroll with overflow when > 5 users
- Tab transitions: `var(--transition-fast)` on hover/active

### 2. Main Layout (Pair Programming Mode)

```
┌──────────────────────────────────────────────────────────┐
│  Header: Room Title  │  Language  │  Users ●●●  │  Share │
├──────────────────────────────────────────────────────────┤
│              │                        │                   │
│   Main       │   Terminal / Output    │  Scratchpad Tabs  │
│   Editor     │                        │  ┌──┬──┬──┐       │
│   (Monaco)   │   $ output here...     │  │A │B │C │       │
│              │                        │  ├──┴──┴──┤       │
│   [Driver    │                        │  │ readonly│       │
│    only]     │                        │  │ view    │       │
│              │                        │  │         │       │
│              │                        │  └─────────┘       │
├──────────────┴────────────────────────┴───────────────────┤
│  Status Bar: Role (Driver/Nav) │ Language │ Line:Col      │
└──────────────────────────────────────────────────────────┘
```

- Use `react-split-pane` or CSS Grid for resizable panels
- Split ratios default: Editor 50% | Terminal 25% | Scratchpads 25%
- All panels have `var(--border-default)` borders between them

### 3. Ghost Merge Overlay

When a Navigator proposes a merge:
- A slide-in panel appears over the Driver's editor
- Shows a **Monaco diff editor** (side-by-side or inline unified diff)
- Two buttons at bottom: ✅ Accept (green) | ❌ Reject (red)
- Smooth `framer-motion` slide-in from right

### 4. Terminal Panel

- Background: `#0d1117` (darkest)
- Font: `JetBrains Mono` at 13px
- Prompt: `$ ` in green (`var(--accent-success)`)
- stdout in white, stderr in red (`var(--accent-error)`)
- Running spinner animation while code executes

### 5. Buttons

```css
/* Primary button */
.btn-primary {
  background: var(--accent-primary);
  color: #ffffff;
  border: none;
  padding: var(--space-2) var(--space-4);
  border-radius: var(--radius-md);
  font-size: var(--text-sm);
  font-weight: 500;
  cursor: pointer;
  transition: all var(--transition-fast);
}
.btn-primary:hover {
  filter: brightness(1.15);
  box-shadow: var(--shadow-glow);
}

/* Ghost button (secondary) */
.btn-ghost {
  background: transparent;
  color: var(--text-secondary);
  border: 1px solid var(--border-default);
  padding: var(--space-2) var(--space-4);
  border-radius: var(--radius-md);
  font-size: var(--text-sm);
  cursor: pointer;
  transition: all var(--transition-fast);
}
.btn-ghost:hover {
  background: var(--bg-elevated);
  color: var(--text-primary);
  border-color: var(--text-secondary);
}
```

### 6. Cards / Panels

- Background: `var(--bg-surface)`
- Border: `1px solid var(--border-default)`
- Border radius: `var(--radius-lg)` (8px)
- Padding: `var(--space-4)` to `var(--space-6)`
- Hover state: `border-color: var(--border-focus)` with `var(--shadow-glow)`

---

## Animation Guidelines (Framer Motion)

| Element | Animation | Duration |
|---------|-----------|----------|
| Page transitions | Fade + slide up | 300ms |
| Modal/Panel open | Slide in from right | 250ms, spring |
| Tab switch | Fade content | 150ms |
| Button hover | Scale 1.02 + glow | 150ms |
| Toast notifications | Slide in from top-right | 200ms |
| Loading states | Skeleton pulse | Infinite loop, 1.5s |
| Ghost Merge badge | Bounce-in | 400ms, spring |

**Rules:**
- Use `framer-motion`'s `AnimatePresence` for enter/exit animations
- Never animate layout shifts that cause content reflow
- Reduce motion for `prefers-reduced-motion` media query
- Loading skeletons use `var(--bg-elevated)` shimmer over `var(--bg-surface)`

---

## Responsive Breakpoints

```css
/* Desktop first approach */
@media (max-width: 1200px) {
  /* Collapse scratchpad sidebar to bottom drawer */
}
@media (max-width: 900px) {
  /* Stack editor + terminal vertically */
  /* Hide scratchpad panel, show as overlay */
}
@media (max-width: 600px) {
  /* Full-screen editor only */
  /* Floating action buttons for terminal, scratchpad */
}
```

---

## Accessibility

1. All interactive elements must have `focus-visible` outlines using `var(--border-focus)`
2. Color contrast ratio: minimum 4.5:1 for text
3. Tab navigation must work for all panels and buttons
4. Screen reader labels on icon-only buttons
5. Keyboard shortcuts displayed in tooltips (e.g., `Ctrl+Enter` to run code)
