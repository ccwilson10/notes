import { useState, useRef, useCallback, useEffect } from 'react'
import { ChevronDown, ChevronRight, Trash2, Archive } from 'lucide-react'
import { useTasksStore } from '../stores/tasks'
import { useAppStore } from '../stores/app'
import { TaskCard } from './TaskCard'
import { groupTasksByDueDate } from '../lib/task-groups'

type Props = {
  filter?: (task: { archived: boolean }) => boolean
}

export function TaskList({ filter }: Props) {
  const tasks = useTasksStore((s) => s.tasks)
  const selectedTaskId = useTasksStore((s) => s.selectedTaskId)
  const selectedTaskIds = useTasksStore((s) => s.selectedTaskIds)
  const select = useTasksStore((s) => s.select)
  const toggleSelect = useTasksStore((s) => s.toggleSelect)
  const selectRange = useTasksStore((s) => s.selectRange)
  const clearMultiSelect = useTasksStore((s) => s.clearMultiSelect)
  const bulkRemove = useTasksStore((s) => s.bulkRemove)
  const bulkArchive = useTasksStore((s) => s.bulkArchive)
  const toggle = useTasksStore((s) => s.toggle)
  const searchQuery = useAppStore((s) => s.searchQuery).toLowerCase()

  const [showCompleted, setShowCompleted] = useState(false)
  const lastClickedId = useRef<string | null>(null)
  const dragAnchor = useRef<string | null>(null)
  const isDragging = useRef(false)

  const matchesSearch = (t: { title: string; body: string }) => {
    if (!searchQuery) return true
    return t.title.toLowerCase().includes(searchQuery) || t.body.toLowerCase().includes(searchQuery)
  }

  const baseFilter = filter ?? ((t: { archived: boolean }) => !t.archived)
  const visible = tasks.filter((t) => baseFilter(t) && matchesSearch(t))
  const incomplete = visible.filter((t) => !t.completed)
  const completed = visible.filter((t) => t.completed)
  const groups = groupTasksByDueDate(incomplete)

  // Flat list of all visible task IDs for range/drag selection
  const allVisibleIds = [
    ...groups.flatMap((g) => g.tasks.map((t) => t.id)),
    ...(showCompleted ? completed.map((t) => t.id) : []),
  ]

  const handleDragStart = useCallback((taskId: string) => {
    dragAnchor.current = taskId
    isDragging.current = false
  }, [])

  const handleDragEnter = useCallback((taskId: string) => {
    if (!dragAnchor.current) return
    if (dragAnchor.current !== taskId) isDragging.current = true
    const from = allVisibleIds.indexOf(dragAnchor.current)
    const to = allVisibleIds.indexOf(taskId)
    if (from !== -1 && to !== -1 && from !== to) {
      const start = Math.min(from, to)
      const end = Math.max(from, to)
      selectRange(allVisibleIds.slice(start, end + 1))
    }
  }, [allVisibleIds, selectRange])

  useEffect(() => {
    const handleMouseUp = () => {
      dragAnchor.current = null
      isDragging.current = false
    }
    window.addEventListener('mouseup', handleMouseUp)
    return () => window.removeEventListener('mouseup', handleMouseUp)
  }, [])

  const handleSelect = (taskId: string, e: React.MouseEvent) => {
    if (isDragging.current && selectedTaskIds.length > 1) return

    if (e.shiftKey && lastClickedId.current) {
      const from = allVisibleIds.indexOf(lastClickedId.current)
      const to = allVisibleIds.indexOf(taskId)
      if (from !== -1 && to !== -1) {
        const start = Math.min(from, to)
        const end = Math.max(from, to)
        selectRange(allVisibleIds.slice(start, end + 1))
        return
      }
    }

    if (e.metaKey || e.ctrlKey) {
      toggleSelect(taskId)
      lastClickedId.current = taskId
      return
    }

    lastClickedId.current = taskId
    select(taskId)
  }

  const isMultiSelect = selectedTaskIds.length > 0

  if (incomplete.length === 0 && completed.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="text-center">
          <p className="text-text-tertiary text-[12px]">
            {searchQuery ? 'No matching tasks' : 'No tasks yet'}
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
          {selectedTaskIds.length || 0} selected
        </span>
        <div className="flex items-center gap-1">
          <button
            onClick={() => bulkArchive(selectedTaskIds)}
            className="flex items-center gap-1 px-2 py-1 text-[11px] text-text-secondary hover:bg-surface-hover rounded-md cursor-pointer"
          >
            <Archive size={12} />
            Archive
          </button>
          <button
            onClick={() => bulkRemove(selectedTaskIds)}
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
        {groups.map((group) => (
          <div key={group.label} className="mb-1">
            <div className="px-4 py-1.5">
              <span className={`text-[11px] font-medium uppercase tracking-wide ${
                group.label === 'Overdue' ? 'text-accent-red' : 'text-text-tertiary'
              }`}>
                {group.label}
              </span>
            </div>
            {group.tasks.map((task) => (
              <TaskCard
                key={task.id}
                task={task}
                selected={task.id === selectedTaskId}
                multiSelected={selectedTaskIds.includes(task.id)}
                onSelect={(e) => handleSelect(task.id, e)}
                onToggle={() => toggle(task.id)}
                onDragStart={() => handleDragStart(task.id)}
                onDragEnter={() => handleDragEnter(task.id)}
              />
            ))}
          </div>
        ))}

        {completed.length > 0 && (
          <div className="mt-2">
            <button
              onClick={() => setShowCompleted(!showCompleted)}
              className="flex items-center gap-1.5 px-4 py-1.5 text-[11px] font-medium uppercase tracking-wide text-text-tertiary hover:text-text-secondary transition-colors duration-150 cursor-pointer"
            >
              {showCompleted ? <ChevronDown size={12} /> : <ChevronRight size={12} />}
              Done ({completed.length})
            </button>
            {showCompleted && completed.map((task) => (
              <TaskCard
                key={task.id}
                task={task}
                selected={task.id === selectedTaskId}
                multiSelected={selectedTaskIds.includes(task.id)}
                onSelect={(e) => handleSelect(task.id, e)}
                onToggle={() => toggle(task.id)}
                onDragStart={() => handleDragStart(task.id)}
                onDragEnter={() => handleDragEnter(task.id)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
