import { useCallback, useRef } from 'react'
import { Trash2, Archive, ArchiveRestore, Pin, PinOff } from 'lucide-react'
import { useNotesStore } from '../stores/notes'
import { CategorySelector } from './CategorySelector'
import { RichEditor } from './RichEditor'
import { relativeTime } from '../lib/time'

export function NoteDetail() {
  const selectedNoteId = useNotesStore((s) => s.selectedNoteId)
  const note = useNotesStore((s) => s.notes.find((n) => n.id === s.selectedNoteId))
  const update = useNotesStore((s) => s.update)
  const remove = useNotesStore((s) => s.remove)
  const select = useNotesStore((s) => s.select)

  const debounceRef = useRef<ReturnType<typeof setTimeout>>(null)

  const debouncedUpdate = useCallback(
    (field: 'title' | 'body', value: string) => {
      if (!selectedNoteId) return
      if (debounceRef.current) clearTimeout(debounceRef.current)
      debounceRef.current = setTimeout(() => {
        update(selectedNoteId, { [field]: value })
      }, 400)
    },
    [selectedNoteId, update]
  )

  if (!note) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <p className="text-text-tertiary text-[12px]">Select a note to view it</p>
      </div>
    )
  }

  return (
    <div className="flex-1 flex flex-col min-h-0">
      <div className="flex items-center justify-between px-5 py-3 border-b border-border">
        <span className="text-[11px] text-text-tertiary">
          {relativeTime(note.updatedAt)}
        </span>
        <div className="flex items-center gap-1">
          <button
            onClick={() => update(note.id, { pinned: !note.pinned })}
            className={`flex items-center justify-center w-7 h-7 rounded-md transition-colors duration-150 cursor-pointer ${
              note.pinned ? 'text-text' : 'text-icon hover:bg-surface-hover'
            }`}
            title={note.pinned ? 'Unpin' : 'Pin'}
          >
            {note.pinned ? <PinOff size={14} /> : <Pin size={14} />}
          </button>
          <button
            onClick={() => update(note.id, { archived: !note.archived })}
            className="flex items-center justify-center w-7 h-7 rounded-md text-icon hover:bg-surface-hover transition-colors duration-150 cursor-pointer"
            title={note.archived ? 'Restore' : 'Archive'}
          >
            {note.archived ? <ArchiveRestore size={14} /> : <Archive size={14} />}
          </button>
          <button
            onClick={() => {
              remove(note.id)
              select(null)
            }}
            className="flex items-center justify-center w-7 h-7 rounded-md text-icon hover:bg-surface-hover hover:text-accent-red transition-colors duration-150 cursor-pointer"
            title="Delete"
          >
            <Trash2 size={14} />
          </button>
        </div>
      </div>

      <div className="flex-1 flex flex-col p-5 overflow-y-auto">
        <input
          key={note.id + '-title'}
          defaultValue={note.title}
          onChange={(e) => debouncedUpdate('title', e.target.value)}
          placeholder="Untitled"
          className="w-full text-[18px] font-medium text-text bg-transparent border-none outline-none placeholder:text-text-tertiary"
        />
        <div className="mt-2">
          <CategorySelector
            value={note.categoryId}
            onChange={(categoryId) => update(note.id, { categoryId })}
          />
        </div>
        <div className="flex-1 mt-2">
          <RichEditor
            key={note.id}
            content={note.body}
            onChange={(html) => debouncedUpdate('body', html)}
            placeholder="Start writing..."
          />
        </div>
      </div>
    </div>
  )
}
