# Product Requirements Document (PRD)
# Interactive Code Collaboration & Learning Platform ("CodeCollab")

---

## 1. Problem Statement

Online developer education and peer collaboration suffer from two isolated, inefficient silos:

### Passive Learning Friction ("Tutorial Hell")
Standard coding education relies on static video (YouTube, Udemy). Students watch a video, but to practice the code, they must manually set up a local environment, type boilerplate, and try to catch up. High friction leads to passive watching, not active coding.

### Collaboration Chaos
Existing live-collaboration tools (VS Code Live Share) require heavy desktop apps and extensions. Browser-based alternatives suffer from "cursor chaos" — multiple people typing simultaneously causes conflicting edits, broken logic, and disrupted thought.

---

## 2. Solution

A unified, lightweight, **browser-native IDE platform** merging video education with structured, real-time collaboration.

### For Learning: "Time-Travel Interactive Lectures"
Video timestamps tightly coupled to code editor state. Students pause, instantly fork code into a live sandbox, experiment, resume with editor snapping back to instructor timeline.

### For Collaboration: "Role-Enforced Pair Programming"
Eliminates cursor chaos via strict Driver (writer) / Navigator (reviewer) roles. Navigators use isolated scratchpads to propose code diffs ("Ghost Merges"), enabling structured peer programming without heavy IDEs.

---

## 3. Target Audiences

| Audience | Need |
|----------|------|
| EdTech Instructors & Bootcamps | Interactive, high-retention coding courses vs static MP4s |
| CS Students & Peer Learners | Frictionless, zero-setup pair programming & algorithm solving |
| Technical Mentors | Instant web room for code review, debugging, teaching |

---

## 4. Feature List

### Mode 1: Learning Mode (Interactive Video)

| Feature | Description | Priority |
|---------|-------------|----------|
| Instructor Video Uploads | Record coding lectures with keystroke logging against timestamps | P0 |
| Time-Travel State Sync | IDE auto-types code synchronized with video playback | P0 |
| Pause-and-Fork Sandbox | On pause, IDE unlocks into isolated sandbox for experimentation | P0 |
| Seamless Resumption | On play, sandbox saved, main editor reverts to instructor timeline | P0 |
| Audio Overlays | Voiceover notes at specific timestamps for complex logic | P1 |

### Mode 2: Pair Programming Mode (Structured Collaboration)

| Feature | Description | Priority |
|---------|-------------|----------|
| Role-Enforced Permissions | Only Driver has write access; Navigators get read-only view | P0 |
| Isolated Scratchpads | Navigators have private editors to test helper functions | P0 |
| Live Snippet Board | Watch all scratchpads in real-time via VS Code-style tab switching | P0 |
| Ghost Merges | Navigators propose scratchpad code as inline Git-style diffs to Driver | P0 |
| Frictionless Role Swapping | "Request Control" button; Driver approves → permissions swap | P0 |

### Global Core Features

| Feature | Description | Priority |
|---------|-------------|----------|
| One-Click Shareable Rooms | Secure UUID links (app.com/room/xyz), no-login-required access | P0 |
| Live Code Execution | Terminal compiling C, C++, Java, Python, JavaScript via Piston API | P0 |
| JS Web Worker Execution | Browser-side JS execution via Web Workers (zero latency) | P1 |
| Block Commenting | Highlight code lines → async Google Docs-style comment threads | P1 |
| Responsive Layout | Collapse sidebars on smaller screens, prioritize editor + video | P1 |

---

## 5. Non-Functional Requirements

| Requirement | Target |
|-------------|--------|
| Real-time latency | < 100ms for keystroke broadcasting |
| Room capacity | Up to 10 concurrent users per room |
| Code execution timeout | 10 seconds max per run |
| Supported languages | C, C++, Java, Python, JavaScript |
| Browser support | Chrome, Firefox, Edge (latest 2 versions) |
| Mobile | Responsive but primarily desktop-focused |

---

## 6. Out of Scope (v1)

- User account system with persistent profiles (optional, not required)
- Payment / subscription system
- Mobile native apps
- Self-hosted code execution (we use Piston API)
- Git integration / version control beyond Ghost Merges
- File tree / multi-file projects (single-file editor per session)
