# Detailed Feature Specifications

> Each feature includes behavior, acceptance criteria, component breakdown, and edge cases.

---

## F1: Room Creation & Sharing

### User Flow
1. Home page → "Create Room" → Modal (type, language, title)
2. Backend generates UUID → redirect to `/room/:roomId`
3. Copy shareable link → collaborators join instantly (no login)

### Acceptance Criteria
- [ ] UUID room URL generated on create
- [ ] One-click copy to clipboard
- [ ] No-login join via URL
- [ ] Room auto-expires after 24h inactivity
- [ ] Max 10 users → "Room full" error

### Components
`CreateRoomModal` · `RoomHeader` · `ShareButton`

---

## F2: Monaco Editor Integration

### Config
- Theme: `vs-dark`, Font: `JetBrains Mono 14px`
- Minimap on, bracket colorization, smooth cursor
- `readOnly` toggled by Driver/Navigator role
- Languages: C, C++, Java, Python, JavaScript

### Acceptance Criteria
- [ ] VS Code Dark+ theme renders correctly
- [ ] Syntax highlighting for all 5 languages
- [ ] Read-only for Navigators, editable for Driver
- [ ] Auto-resize on panel resize

### Components
`CodeEditor` · `EditorToolbar` (language selector, Run button)

---

## F3: Role-Enforced Pair Programming

### State Machine
- First user → **Driver** (auto)
- Others → **Navigator**
- Navigator "Request Control" → Driver popup → Approve/Deny
- Driver disconnects → longest-connected Navigator promoted

### Acceptance Criteria
- [ ] First user = Driver automatically
- [ ] Navigators see read-only editor
- [ ] "Request Control" button only for Navigators
- [ ] Role swap < 200ms
- [ ] Role shown in status bar
- [ ] Auto-promote on Driver disconnect

### Components
`RoleIndicator` · `RequestControlButton` · `SwapRequestModal` · `ParticipantList`

---

## F4: Scratchpad System with VS Code Tab Switching

### Behavior
- Each Navigator has a private scratchpad (mini Monaco editor)
- All scratchpads visible via **VS Code-style tab bar** at top of panel
- Tab = colored dot + username, active tab merges with editor below
- Own scratchpad editable; others' read-only
- Real-time updates via Socket.io deltas

### Tab Bar Spec (VS Code Clone)
- Height: 35px, active: `--editor-bg` bg, inactive: `--bg-surface`
- Active tab: no bottom border; inactive: 1px bottom border
- Color dot (8px) + username per tab
- Horizontal scroll on overflow
- Close (×) on hover

### Acceptance Criteria
- [ ] Isolated scratchpad per participant
- [ ] Tab bar with VS Code visual style
- [ ] Active tab visually distinct
- [ ] Click tab → switch to user's scratchpad
- [ ] Real-time typing updates across viewers
- [ ] Driver tab labeled "(Driver)"

### Components
`ScratchpadPanel` · `ScratchpadTabBar` · `ScratchpadTab` · `ScratchpadEditor`

---

## F5: Ghost Merge (Propose & Accept)

### Flow
1. Navigator writes code in scratchpad → clicks "Propose Snippet"
2. Server captures original (main editor) + proposed (scratchpad)
3. Driver sees notification badge (bounce animation)
4. Driver opens → Monaco DiffEditor (side-by-side diff)
5. Accept → merge into main editor / Reject → notify Navigator

### Acceptance Criteria
- [ ] "Propose Snippet" in scratchpad toolbar
- [ ] Monaco DiffEditor shows visual diff
- [ ] Driver notification badge with pending count
- [ ] Accept merges code, reject dismisses
- [ ] Multiple proposals queue (stack, not overlay)
- [ ] Auto-expire after 5 min if unreviewed

### Components
`ProposeButton` · `GhostMergeBadge` · `GhostMergePanel` · `GhostMergeDiffView`

---

## F6: Live Code Execution

### Execution Flow
- **JavaScript** → Web Worker in browser (zero latency)
- **C/C++/Java/Python** → POST `/api/execute` → Piston API (Docker sandbox)
- Timeout: 10 seconds max

### Terminal
- Font: JetBrains Mono 13px, BG: `#0d1117`
- stdout = white, stderr = red, prompt = green `$`
- Loading spinner during execution
- History: scrollable last 10 runs

### Acceptance Criteria
- [ ] "Run" button + `Ctrl+Enter` shortcut
- [ ] Terminal output with correct coloring
- [ ] 10s execution timeout
- [ ] JS via Web Worker, others via Piston
- [ ] Stdin input field (optional, expandable)

### Components
`Terminal` · `RunButton` · `webWorkerRunner.js` · `pistonService.js`

---

## F7: Time-Travel Lectures (Learning Mode)

### Recording (Instructor)
- Code changes logged as `{ timestamp, codeSnapshot, cursorPosition }` timeline

### Playback (Learner)
- Video + editor side by side
- Code auto-syncs with video timestamp
- **Pause** → editor unlocks (sandbox fork)
- **Play** → sandbox saved, editor reverts to instructor timeline
- Seeking video jumps code to nearest snapshot

### Acceptance Criteria
- [ ] Video + editor side-by-side layout
- [ ] Code auto-syncs during playback
- [ ] Pause unlocks sandbox editing
- [ ] Play restores instructor timeline
- [ ] Sandbox preserved in session storage
- [ ] Timeline scrubber shows code change markers

### Components
`LectureView` · `VideoPlayer` · `TimelineSync` · `SandboxManager`

---

## F8: Block Commenting

### Flow
1. Select code lines → "Add Comment" button appears
2. Comment input anchored to line range
3. Comment saved + broadcast to room
4. Yellow highlight on commented lines
5. Click highlight → open thread (supports replies + resolve)

### Acceptance Criteria
- [ ] Line selection → comment button
- [ ] Comments anchored to line ranges
- [ ] Threads support replies
- [ ] "Resolve" closes thread
- [ ] Persisted in MongoDB
- [ ] Yellow gutter highlight for commented lines

### Components
`CommentGutter` · `CommentThread` · `CommentForm` · `CommentHighlight`
