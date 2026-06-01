import { useRef, useCallback, useEffect } from 'react'
import { Trash2, Archive } from 'lucide-react'
import { useNotesStore } from '../stores/notes'
import { useAppStore } from '../stores/app'
import { NoteCard } from './NoteCard'

type Props = {
  filter?: (note: { archived: boolean; categoryId: string | null }) => boolean
}

export function NoteList({ filter }: Props) {
  const notes = useNotesStore((s) => s.notes)
  const selectedNoteId = useNotesStore((s) => s.selectedNoteId)
  const selectedNoteIds = useNotesStore((s) => s.selectedNoteIds)
  const select = useNotesStore((s) => s.select)
  const toggleSelect = useNotesStore((s) => s.toggleSelect)
  const selectRange = useNotesStore((s) => s.selectRange)
  const clearMultiSelect = useNotesStore((s) => s.clearMultiSelect)
  const bulkRemove = useNotesStore((s) => s.bulkRemove)
  const bulkArchive = useNotesStore((s) => s.bulkArchive)
  const searchQuery = useAppStore((s) => s.searchQuery).toLowerCase()
  const lastClickedId = useRef<string | null>(null)
  const dragAnchor = useRef<string | null>(null)
  const isDragging = useRef(false)

  const filtered = notes
    .filter(filter ?? ((n) => !n.archived))
    .filter((n) => {
      if (!searchQuery) return true
      return n.title.toLowerCase().includes(searchQuery) || n.body.toLowerCase().includes(searchQuery)
    })
    .sort((a, b) => {
      if (a.pinned !== b.pinned) return a.pinned ? -1 : 1
      return b.updatedAt - a.updatedAt
    })

  const filteredIds = filtered.map((n) => n.id)

  const handleDragStart = useCallback((noteId: string) => {
    dragAnchor.current = noteId
    isDragging.current = false
  }, [])

  const handleDragEnter = useCallback((noteId: string) => {
    if (!dragAnchor.current) return
    if (dragAnchor.current !== noteId) isDragging.current = true
    const from = filteredIds.indexOf(dragAnchor.current)
    const to = filteredIds.indexOf(noteId)
    if (from !== -1 && to !== -1 && from !== to) {
      const start = Math.min(from, to)
      const end = Math.max(from, to)
      selectRange(filteredIds.slice(start, end + 1))
    }
  }, [filteredIds, selectRange])

  useEffect(() => {
    const handleMouseUp = () => {
      dragAnchor.current = null
      isDragging.current = false
    }
    window.addEventListener('mouseup', handleMouseUp)
    return () => window.removeEventListener('mouseup', handleMouseUp)
  }, [])

  const handleSelect = (noteId: string, e: React.MouseEvent) => {
    if (isDragging.current && selectedNoteIds.length > 1) return

    if (e.shiftKey && lastClickedId.current) {
      const ids = filtered.map((n) => n.id)
      const from = ids.indexOf(lastClickedId.current)
      const to = ids.indexOf(noteId)
      if (from !== -1 && to !== -1) {
        const start = Math.min(from, to)
        const end = Math.max(from, to)
        selectRange(ids.slice(start, end + 1))
        return
      }
    }

    if (e.metaKey || e.ctrlKey) {
      toggleSelect(noteId)
      lastClickedId.current = noteId
      return
    }

    lastClickedId.current = noteId
    select(noteId)
  }

  const isMultiSelect = selectedNoteIds.length > 0

  if (filtered.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="text-center">
          <p className="text-text-tertiary text-[12px]">
            {searchQuery ? 'No matching notes' : 'No notes yet'}
          </p>
          {!searchQuery && (
            <p className="text-text-tertiary text-[11px] mt-1 opacity-60">
              Type above to create one
            </p>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className="flex-1 flex flex-col min-h-0">
      <div className={`flex items-center justify-between px-3 py-2 border-b border-border shrink-0 transition-opacity duration-150 ${isMultiSelect ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
          <span className="text-[12px] text-text-secondary">
            {selectedNoteIds.length || 0} selected
          </span>
          <div className="flex items-center gap-1">
            <button
              onClick={() => bulkArchive(selectedNoteIds)}
              className="flex items-center gap-1 px-2 py-1 text-[11px] text-text-secondary hover:bg-surface-hover rounded-md cursor-pointer"
            >
              <Archive size={12} />
              Archive
            </button>
            <button
              onClick={() => bulkRemove(selectedNoteIds)}
              className="flex items-center gap-1 px-2 py-1 text-[11px] text-text-secondary hover:bg-surface-hover hover:text-accent-red rounded-md cursor-pointer"
            >
              <Trash2 size={12} />
              Delete
            </button>
            <button
              onClick={clearMultiSelect}
              className="px-2 py-1 text-[11px] text-text-tertiary hover:text-text-secondary cursor-pointer"
            >
              Cancel
            </button>
          </div>
        </div>
      <div className="flex-1 overflow-y-auto pt-2.5" onClick={(e) => {
        if (e.target === e.currentTarget && isMultiSelect) clearMultiSelect()
      }}>
        {filtered.map((note) => (
          <NoteCard
            key={note.id}
            note={note}
            selected={note.id === selectedNoteId}
            multiSelected={selectedNoteIds.includes(note.id)}
            onSelect={(e) => handleSelect(note.id, e)}
            onDragStart={() => handleDragStart(note.id)}
            onDragEnter={() => handleDragEnter(note.id)}
          />
        ))}
      </div>
    </div>
  )
}
