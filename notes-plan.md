# Notes App — Project Plan

## Stack

- **Runtime:** Vite 6 + React 19 + TypeScript
- **Styling:** Tailwind CSS 4
- **State:** Zustand (lightweight, no boilerplate)
- **Storage:** IndexedDB via `idb` (local-first, fast, supports large data)
- **Icons:** Lucide React (clean, minimal line icons)
- **IDs:** nanoid
- **Fonts:** Inter (clean, modern — warmth comes from color and spacing, not typeface)

---

## Design System

### Palette — Warm Neutrals

| Token            | Value     | Usage                          |
|------------------|-----------|--------------------------------|
| `bg`             | `#F7F4EF` | Page background                |
| `surface`        | `#F0ECE7` | Cards, panels, elevated areas  |
| `surface-hover`  | `#E8E3DB` | Hover states                   |
| `border`         | `#E3DDD3` | Dividers, subtle borders       |
| `text`           | `#3B3631` | Primary text                   |
| `text-secondary` | `#8A8279` | Secondary text, placeholders   |
| `text-tertiary`  | `#B8B0A4` | Disabled text, hints           |
| `icon`           | `#6B6560` | Icons, metadata                |
| `accent-red`     | `#C46A5A` | Category indicator             |
| `accent-amber`   | `#C49B5A` | Category indicator             |
| `accent-green`   | `#7BA477` | Category indicator             |
| `accent-blue`    | `#5A8EC4` | Category indicator             |
| `accent-purple`  | `#9B7BBF` | Category indicator             |

### Visual Principles

- No harsh whites — the lightest tone is a warm off-white (`#F7F4EF`)
- No heavy shadows — depth comes from tonal layering (bg → surface → surface-hover)
- Borders are rare and soft; prefer spacing and background shifts to separate content
- Rounded corners: 8px for cards/panels, 6px for buttons/inputs/chips
- Category indicators are small filled circles, used sparingly for color
- Typography drives hierarchy: 13px body, 11px metadata, 18-20px section headings; use weight and size to separate levels, not decoration
- Spacing is generous — the interface should feel unhurried and breathable
- The overall mood is calm and warm, like a well-made tool — not skeuomorphic, not sterile
- Transitions are subtle (150-200ms ease) — things settle, they don't snap
- Interactive elements have clear hover/active states; the UI should feel responsive and precise

---

## Information Architecture

```
App
├── Sidebar (collapsible)
│   ├── Inbox (uncategorized capture)
│   ├── Notes
│   ├── Tasks
│   ├── Categories (filterable list)
│   └── Archive
│
├── Main Content Area
│   ├── List View (default)
│   │   ├── Search / Filter bar
│   │   └── Card list (notes or tasks)
│   │
│   └── Detail View (slide-in panel or inline expand)
│       ├── Title (editable inline)
│       ├── Body (markdown-lite editor)
│       ├── Category dot selector
│       ├── Metadata (created, updated)
│       └── Task-specific: checkbox, due date, priority
│
└── Quick Capture Bar (persistent, bottom or top)
```

---

## Data Models

### Note

```ts
type Note = {
  id: string
  title: string
  body: string           // plain text or simple markdown
  categoryId: string | null
  pinned: boolean
  archived: boolean
  createdAt: number      // timestamp
  updatedAt: number
}
```

### Task

```ts
type Task = {
  id: string
  title: string
  body: string
  categoryId: string | null
  completed: boolean
  completedAt: number | null
  dueDate: string | null  // ISO date string, no time
  priority: 'low' | 'medium' | 'high' | null
  pinned: boolean
  archived: boolean
  createdAt: number
  updatedAt: number
}
```

### Category

```ts
type Category = {
  id: string
  name: string
  color: 'red' | 'amber' | 'green' | 'blue' | 'purple'
  sortOrder: number
}
```

---

## UX Flows

### 1. Quick Capture

- A persistent input bar at the top of the main area
- Type and press Enter to create a note in Inbox
- Prefix with `[ ]` or `/task` to create a task instead
- Minimal friction — no modal, no form, just type and go

### 2. Browsing Notes

- Default view: all notes, most recently updated first
- Cards show: title (or first line if no title), category dot, relative timestamp
- Click a card to open detail panel (slides in from right)
- Pinned notes stick to top

### 3. Browsing Tasks

- Default view: incomplete tasks grouped by due date (overdue, today, upcoming, someday)
- Completed tasks collapse into a "Done" section at the bottom
- Click checkbox to toggle completion with a soft animation
- Click card body to open detail panel

### 4. Editing a Note or Task

- Inline title editing — click and type
- Body is a plain textarea with optional markdown rendering
- Category selector: row of colored dots, click to assign
- For tasks: due date picker (native date input, styled), priority selector
- Auto-saves on every change (debounced 500ms)
- No explicit save button — feels like writing on paper

### 5. Organizing with Categories

- Categories live in sidebar as colored dot + label
- Click a category to filter the current view
- Create new categories inline from sidebar ("+ New Category")
- Drag to reorder (stretch goal)

### 6. Search

- Search bar at top of list view, filters as you type
- Searches title and body content
- Highlights matching text in results

### 7. Archive

- Swipe left or use menu to archive a note/task
- Archived items move to the Archive section
- Can be restored or permanently deleted from there

---

## Implementation Phases

### Phase 1 — Foundation
- [ ] Project scaffolding (Vite + React + TS + Tailwind)
- [ ] Design tokens and base styles (palette, typography, spacing)
- [ ] App shell layout: sidebar + main content area
- [ ] Basic routing (sidebar nav between sections)

### Phase 2 — Notes (Core)
- [ ] Zustand store for notes
- [ ] IndexedDB persistence layer
- [ ] Note list view with cards
- [ ] Note detail panel (view + edit)
- [ ] Quick capture bar (notes)
- [ ] Auto-save with debounce

### Phase 3 — Tasks
- [ ] Zustand store for tasks
- [ ] Task list view with grouping (due date sections)
- [ ] Task detail panel with checkbox, due date, priority
- [ ] Quick capture: `/task` or `[ ]` prefix
- [ ] Task completion toggle with animation

### Phase 4 — Categories
- [ ] Zustand store for categories
- [ ] Category management in sidebar
- [ ] Category dot selector in detail panels
- [ ] Filter views by category

### Phase 5 — Search & Polish
- [ ] Search bar with live filtering
- [ ] Pin/unpin notes and tasks
- [ ] Archive flow (archive, view archived, restore, delete)
- [ ] Empty states (friendly, warm illustrations or messages)
- [ ] Keyboard shortcuts (n = new note, t = new task, / = search)

### Phase 6 — Stretch Goals
- [ ] Markdown rendering in note body
- [ ] Drag-to-reorder categories
- [ ] Dark mode (warm dark, not cold — think aged paper in lamplight)
- [ ] Export notes as .md files
- [ ] Drag tasks between priority groups
