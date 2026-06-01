import { create } from 'zustand'
import { nanoid } from 'nanoid'
import { db } from '../lib/db'
import type { Note } from '../lib/types'

type NotesState = {
  notes: Note[]
  selectedNoteId: string | null
  selectedNoteIds: string[]
  loaded: boolean
  load: () => Promise<void>
  create: (title: string) => Promise<Note>
  update: (id: string, changes: Partial<Pick<Note, 'title' | 'body' | 'categoryId' | 'pinned' | 'archived'>>) => Promise<void>
  remove: (id: string) => Promise<void>
  select: (id: string | null) => void
  toggleSelect: (id: string) => void
  selectRange: (ids: string[]) => void
  clearMultiSelect: () => void
  bulkRemove: (ids: string[]) => Promise<void>
  bulkArchive: (ids: string[]) => Promise<void>
}

export const useNotesStore = create<NotesState>((set, get) => ({
  notes: [],
  selectedNoteId: null,
  selectedNoteIds: [],
  loaded: false,

  async load() {
    const notes = await db.notes.getAll()
    set({ notes, loaded: true })
  },

  async create(title: string) {
    const now = Date.now()
    const note: Note = {
      id: nanoid(),
      title,
      body: '',
      categoryId: null,
      pinned: false,
      archived: false,
      createdAt: now,
      updatedAt: now,
    }
    await db.notes.put(note)
    set((s) => ({ notes: [note, ...s.notes], selectedNoteId: note.id }))
    return note
  },

  async update(id, changes) {
    const note = get().notes.find((n) => n.id === id)
    if (!note) return
    const updated = { ...note, ...changes, updatedAt: Date.now() }
    await db.notes.put(updated)
    set((s) => ({
      notes: s.notes.map((n) => (n.id === id ? updated : n)),
    }))
  },

  async remove(id) {
    await db.notes.delete(id)
    set((s) => ({
      notes: s.notes.filter((n) => n.id !== id),
      selectedNoteId: s.selectedNoteId === id ? null : s.selectedNoteId,
    }))
  },

  select(id) {
    set({ selectedNoteId: id, selectedNoteIds: [] })
  },

  toggleSelect(id) {
    set((s) => {
      const ids = s.selectedNoteIds.includes(id)
        ? s.selectedNoteIds.filter((i) => i !== id)
        : [...s.selectedNoteIds, id]
      return { selectedNoteIds: ids, selectedNoteId: ids.length === 0 ? s.selectedNoteId : null }
    })
  },

  selectRange(ids) {
    set({ selectedNoteIds: ids, selectedNoteId: null })
  },

  clearMultiSelect() {
    set({ selectedNoteIds: [] })
  },

  async bulkRemove(ids) {
    for (const id of ids) await db.notes.delete(id)
    set((s) => ({
      notes: s.notes.filter((n) => !ids.includes(n.id)),
      selectedNoteIds: [],
      selectedNoteId: ids.includes(s.selectedNoteId ?? '') ? null : s.selectedNoteId,
    }))
  },

  async bulkArchive(ids) {
    const now = Date.now()
    const noteMap = new Map(get().notes.map((n) => [n.id, n]))
    for (const id of ids) {
      const note = noteMap.get(id)
      if (note) {
        const updated = { ...note, archived: true, updatedAt: now }
        await db.notes.put(updated)
      }
    }
    set((s) => ({
      notes: s.notes.map((n) => ids.includes(n.id) ? { ...n, archived: true, updatedAt: now } : n),
      selectedNoteIds: [],
      selectedNoteId: ids.includes(s.selectedNoteId ?? '') ? null : s.selectedNoteId,
    }))
  },
}))
