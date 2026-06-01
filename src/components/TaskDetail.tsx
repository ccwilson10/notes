import { useCallback, useRef, useState } from 'react'
import { Trash2, Archive, ArchiveRestore, Circle, CheckCircle2, Pin, PinOff, Calendar } from 'lucide-react'
import { DayPicker } from 'react-day-picker'
import { useTasksStore } from '../stores/tasks'
import { CategorySelector } from './CategorySelector'
import { RichEditor } from './RichEditor'
import { relativeTime } from '../lib/time'

const priorities = [
  { value: null, label: 'None', activeColor: 'text-text' },
  { value: 'low' as const, label: 'Low', activeColor: 'text-accent-green' },
  { value: 'medium' as const, label: 'Medium', activeColor: 'text-accent-amber' },
  { value: 'high' as const, label: 'High', activeColor: 'text-accent-red' },
]

export function TaskDetail() {
  const selectedTaskId = useTasksStore((s) => s.selectedTaskId)
  const task = useTasksStore((s) => s.tasks.find((t) => t.id === s.selectedTaskId))
  const update = useTasksStore((s) => s.update)
  const toggle = useTasksStore((s) => s.toggle)
  const remove = useTasksStore((s) => s.remove)
  const select = useTasksStore((s) => s.select)

  const debounceRef = useRef<ReturnType<typeof setTimeout>>(null)

  const debouncedUpdate = useCallback(
    (field: 'title' | 'body', value: string) => {
      if (!selectedTaskId) return
      if (debounceRef.current) clearTimeout(debounceRef.current)
      debounceRef.current = setTimeout(() => {
        update(selectedTaskId, { [field]: value })
      }, 400)
    },
    [selectedTaskId, update]
  )

  if (!task) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <p className="text-text-tertiary text-[12px]">Select a task to view it</p>
      </div>
    )
  }

  return (
    <div className="flex-1 flex flex-col min-h-0">
      <div className="flex items-center justify-between px-5 py-3 border-b border-border">
        <span className="text-[11px] text-text-tertiary">
          {relativeTime(task.updatedAt)}
        </span>
        <div className="flex items-center gap-1">
          <button
            onClick={() => update(task.id, { pinned: !task.pinned })}
            className={`flex items-center justify-center w-7 h-7 rounded-md transition-colors duration-150 cursor-pointer ${
              task.pinned ? 'text-text' : 'text-icon hover:bg-surface-hover'
            }`}
            title={task.pinned ? 'Unpin' : 'Pin'}
          >
            {task.pinned ? <PinOff size={14} /> : <Pin size={14} />}
          </button>
          <button
            onClick={() => update(task.id, { archived: !task.archived })}
            className="flex items-center justify-center w-7 h-7 rounded-md text-icon hover:bg-surface-hover transition-colors duration-150 cursor-pointer"
            title={task.archived ? 'Restore' : 'Archive'}
          >
            {task.archived ? <ArchiveRestore size={14} /> : <Archive size={14} />}
          </button>
          <button
            onClick={() => {
              remove(task.id)
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
        <div className="flex items-start gap-3">
          <button
            onClick={() => toggle(task.id)}
            className={`mt-1 shrink-0 transition-colors duration-200 cursor-pointer ${
              task.completed ? 'text-accent-green' : 'text-text-tertiary'
            }`}
          >
            {task.completed ? <CheckCircle2 size={20} /> : <Circle size={20} />}
          </button>
          <input
            key={task.id + '-title'}
            defaultValue={task.title}
            onChange={(e) => debouncedUpdate('title', e.target.value)}
            placeholder="Untitled"
            className={`w-full text-[18px] font-medium bg-transparent border-none outline-none placeholder:text-text-tertiary transition-colors duration-200 ${
              task.completed ? 'text-text-tertiary line-through' : 'text-text'
            }`}
          />
        </div>

        <div className="mt-4 ml-8 space-y-2">
          <div className="grid grid-cols-[auto_1fr] gap-x-3 gap-y-2 items-center">
            <label className="text-[11px] text-text-tertiary uppercase tracking-wide">Due</label>
            <DatePicker
              value={task.dueDate ?? null}
              onChange={(date) => update(task.id, { dueDate: date })}
            />

            <label className="text-[11px] text-text-tertiary uppercase tracking-wide">Priority</label>
            <div className="flex gap-0.5">
              {priorities.map((p) => (
                <button
                  key={p.label}
                  onClick={() => update(task.id, { priority: p.value })}
                  className={`text-[12px] px-2 py-0.5 rounded-md cursor-pointer ${
                    task.priority === p.value
                      ? `bg-surface-hover ${p.activeColor} font-medium`
                      : 'text-text-secondary hover:bg-surface'
                  }`}
                >
                  {p.label}
                </button>
              ))}
            </div>

            <div className="col-span-2">
              <CategorySelector
                value={task.categoryId}
                onChange={(categoryId) => update(task.id, { categoryId })}
              />
            </div>
          </div>
        </div>

        <div className="flex-1 mt-4 ml-8">
          <RichEditor
            key={task.id}
            content={task.body}
            onChange={(html) => debouncedUpdate('body', html)}
            placeholder="Add notes..."
          />
        </div>
      </div>
    </div>
  )
}

function DatePicker({ value, onChange }: { value: string | null; onChange: (date: string | null) => void }) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  const selected = value ? new Date(value + 'T00:00:00') : undefined
  const displayText = selected
    ? selected.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
    : 'No date'

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-1.5 text-[12px] px-2 py-0.5 rounded-md bg-surface border border-border cursor-pointer hover:bg-surface-hover"
      >
        <Calendar size={12} className="text-text-secondary" />
        <span className={value ? 'text-text' : 'text-text-tertiary'}>{displayText}</span>
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
          <div className="absolute top-full left-0 mt-1 z-20 bg-bg border border-border rounded-lg shadow-lg p-2">
            <DayPicker
              mode="single"
              selected={selected}
              onSelect={(day) => {
                if (day) {
                  const y = day.getFullYear()
                  const m = String(day.getMonth() + 1).padStart(2, '0')
                  const d = String(day.getDate()).padStart(2, '0')
                  onChange(`${y}-${m}-${d}`)
                } else {
                  onChange(null)
                }
                setOpen(false)
              }}
              classNames={{
                root: 'rdp-custom',
                months: 'flex',
                month_caption: 'flex justify-center items-center h-8 text-[13px] font-medium text-text',
                nav: 'flex items-center justify-between absolute top-2 left-2 right-2',
                button_previous: 'w-6 h-6 flex items-center justify-center rounded hover:bg-surface-hover text-text-secondary cursor-pointer',
                button_next: 'w-6 h-6 flex items-center justify-center rounded hover:bg-surface-hover text-text-secondary cursor-pointer',
                weekdays: 'flex',
                weekday: 'w-8 text-center text-[11px] text-text-tertiary font-normal',
                week: 'flex',
                day: 'w-8 h-8 flex items-center justify-center text-[12px] text-text rounded cursor-pointer hover:bg-surface-hover',
                day_button: 'w-full h-full flex items-center justify-center rounded cursor-pointer',
                selected: 'bg-surface-hover font-medium',
                today: 'font-semibold text-accent-blue',
                outside: 'text-text-tertiary opacity-50',
              }}
            />
            {value && (
              <button
                onClick={() => { onChange(null); setOpen(false) }}
                className="w-full text-[11px] text-text-secondary hover:text-text py-1 cursor-pointer"
              >
                Clear date
              </button>
            )}
          </div>
        </>
      )}
    </div>
  )
}
