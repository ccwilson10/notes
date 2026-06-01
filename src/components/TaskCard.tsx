import { Circle, CheckCircle2, Pin } from 'lucide-react'
import type { Task } from '../lib/types'

type Props = {
  task: Task
  selected: boolean
  multiSelected: boolean
  onSelect: (e: React.MouseEvent) => void
  onToggle: () => void
  onDragStart: () => void
  onDragEnter: () => void
}

const priorityColors: Record<string, string> = {
  high: 'text-accent-red',
  medium: 'text-accent-amber',
  low: 'text-accent-green',
}

export function TaskCard({ task, selected, multiSelected, onSelect, onToggle, onDragStart, onDragEnter }: Props) {
  return (
    <div
      className={`flex items-start gap-2.5 px-4 py-2.5 transition-colors duration-150 cursor-pointer select-none ${
        multiSelected
          ? 'bg-surface-hover'
          : selected
            ? 'bg-surface-hover'
            : 'hover:bg-surface'
      }`}
      onClick={onSelect}
      onMouseDown={onDragStart}
      onMouseEnter={onDragEnter}
    >
      <button
        onClick={(e) => {
          e.stopPropagation()
          onToggle()
        }}
        className={`mt-0.5 shrink-0 transition-colors duration-200 cursor-pointer ${
          task.completed
            ? 'text-accent-green'
            : priorityColors[task.priority ?? ''] ?? 'text-text-tertiary'
        }`}
      >
        {task.completed ? <CheckCircle2 size={16} /> : <Circle size={16} />}
      </button>

      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-1.5">
          {task.pinned && <Pin size={12} className="text-accent-amber shrink-0" />}
          <span
            className={`text-[13px] truncate block transition-colors duration-200 ${
              task.completed ? 'text-text-tertiary line-through' : 'text-text'
            }`}
          >
            {task.title || 'Untitled'}
          </span>
        </div>
        {task.dueDate && (
          <span className={`text-[11px] mt-0.5 block ${
            !task.completed && task.dueDate < new Date().toISOString().slice(0, 10)
              ? 'text-accent-red'
              : 'text-text-tertiary'
          }`}>
            {new Date(task.dueDate + 'T00:00:00').toLocaleDateString('en-US', {
              month: 'short',
              day: 'numeric',
            })}
          </span>
        )}
      </div>
    </div>
  )
}
