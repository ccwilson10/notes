import { Pin } from 'lucide-react'
import { useCategoriesStore } from '../stores/categories'
import { CategoryDot } from './CategoryDot'
import { relativeTime } from '../lib/time'
import type { Note } from '../lib/types'

type Props = {
  note: Note
  selected: boolean
  multiSelected: boolean
  onSelect: (e: React.MouseEvent) => void
  onDragStart: () => void
  onDragEnter: () => void
}

export function NoteCard({ note, selected, multiSelected, onSelect, onDragStart, onDragEnter }: Props) {
  const category = useCategoriesStore((s) => s.categories.find((c) => c.id === note.categoryId))
  const stripHtml = (html: string) => html.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim()
  const bodyText = stripHtml(note.body)
  const preview = note.title || bodyText || 'Untitled'
  const snippet = note.title && bodyText
    ? bodyText.slice(0, 80)
    : null

  return (
    <div
      onClick={onSelect}
      onMouseDown={onDragStart}
      onMouseEnter={onDragEnter}
      className={`w-full text-left px-4 py-2.5 flex flex-col justify-center cursor-pointer select-none transition-colors duration-150 ${
        multiSelected
          ? 'bg-surface-hover'
          : selected
            ? 'bg-surface-hover'
            : 'hover:bg-surface'
      }`}
    >
      <div className="flex items-start justify-between gap-2 w-full">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5">
            {category && <CategoryDot color={category.color} size={6} />}
            {note.pinned && <Pin size={12} className="text-accent-amber shrink-0" />}
            <span className="text-[13px] font-medium text-text truncate block">
              {preview}
            </span>
          </div>
          {snippet && (
            <p className="text-[12px] text-text-secondary truncate mt-0.5">
              {snippet}
            </p>
          )}
        </div>
        <span className="text-[11px] text-text-tertiary whitespace-nowrap shrink-0 mt-0.5">
          {relativeTime(note.updatedAt)}
        </span>
      </div>
    </div>
  )
}
