import { useState, type KeyboardEvent } from 'react'
import { Plus } from 'lucide-react'
import { useNotesStore } from '../stores/notes'
import { useTasksStore } from '../stores/tasks'
import { useAppStore } from '../stores/app'

type Props = {
  mode?: 'notes' | 'tasks'
}

export function QuickCapture({ mode = 'notes' }: Props) {
  const [value, setValue] = useState('')
  const createNote = useNotesStore((s) => s.create)
  const createTask = useTasksStore((s) => s.create)
  const setView = useAppStore((s) => s.setView)

  const handleSubmit = async () => {
    const trimmed = value.trim()
    if (!trimmed) return

    const isTask = mode === 'tasks' || trimmed.startsWith('/task ') || trimmed.startsWith('[] ') || trimmed.startsWith('[ ] ')

    if (isTask) {
      const title = trimmed
        .replace(/^\/task\s+/, '')
        .replace(/^\[\s?\]\s+/, '')
      if (!title) return
      await createTask(title)
      if (mode !== 'tasks') setView('tasks')
    } else {
      await createNote(trimmed)
    }
    setValue('')
  }

  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSubmit()
    }
  }

  const placeholder = mode === 'tasks'
    ? 'New task...'
    : 'New note... (or /task, [ ] for a task)'

  return (
    <div className="flex items-center gap-2 px-4 h-[53px] border-b border-border shrink-0">
      <Plus size={16} className="text-text-secondary shrink-0" />
      <input
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        className="flex-1 text-[13px] text-text bg-transparent border-none outline-none placeholder:text-text-secondary"
      />
    </div>
  )
}
