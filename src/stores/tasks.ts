import { create } from 'zustand'
import { nanoid } from 'nanoid'
import { db } from '../lib/db'
import type { Task } from '../lib/types'

type TasksState = {
  tasks: Task[]
  selectedTaskId: string | null
  selectedTaskIds: string[]
  loaded: boolean
  load: () => Promise<void>
  create: (title: string) => Promise<Task>
  update: (id: string, changes: Partial<Pick<Task, 'title' | 'body' | 'categoryId' | 'completed' | 'dueDate' | 'priority' | 'pinned' | 'archived'>>) => Promise<void>
  toggle: (id: string) => Promise<void>
  remove: (id: string) => Promise<void>
  select: (id: string | null) => void
  toggleSelect: (id: string) => void
  selectRange: (ids: string[]) => void
  clearMultiSelect: () => void
  bulkRemove: (ids: string[]) => Promise<void>
  bulkArchive: (ids: string[]) => Promise<void>
}

export const useTasksStore = create<TasksState>((set, get) => ({
  tasks: [],
  selectedTaskId: null,
  selectedTaskIds: [],
  loaded: false,

  async load() {
    const tasks = await db.tasks.getAll()
    set({ tasks, loaded: true })
  },

  async create(title: string) {
    const now = Date.now()
    const task: Task = {
      id: nanoid(),
      title,
      body: '',
      categoryId: null,
      completed: false,
      completedAt: null,
      dueDate: null,
      priority: null,
      pinned: false,
      archived: false,
      createdAt: now,
      updatedAt: now,
    }
    await db.tasks.put(task)
    set((s) => ({ tasks: [task, ...s.tasks], selectedTaskId: task.id }))
    return task
  },

  async update(id, changes) {
    const task = get().tasks.find((t) => t.id === id)
    if (!task) return
    const updated = { ...task, ...changes, updatedAt: Date.now() }
    await db.tasks.put(updated)
    set((s) => ({
      tasks: s.tasks.map((t) => (t.id === id ? updated : t)),
    }))
  },

  async toggle(id) {
    const task = get().tasks.find((t) => t.id === id)
    if (!task) return
    const completed = !task.completed
    const updated = {
      ...task,
      completed,
      completedAt: completed ? Date.now() : null,
      updatedAt: Date.now(),
    }
    await db.tasks.put(updated)
    set((s) => ({
      tasks: s.tasks.map((t) => (t.id === id ? updated : t)),
    }))
  },

  async remove(id) {
    await db.tasks.delete(id)
    set((s) => ({
      tasks: s.tasks.filter((t) => t.id !== id),
      selectedTaskId: s.selectedTaskId === id ? null : s.selectedTaskId,
    }))
  },

  select(id) {
    set({ selectedTaskId: id, selectedTaskIds: [] })
  },

  toggleSelect(id) {
    set((s) => {
      const ids = s.selectedTaskIds.includes(id)
        ? s.selectedTaskIds.filter((i) => i !== id)
        : [...s.selectedTaskIds, id]
      return { selectedTaskIds: ids, selectedTaskId: ids.length === 0 ? s.selectedTaskId : null }
    })
  },

  selectRange(ids) {
    set({ selectedTaskIds: ids, selectedTaskId: null })
  },

  clearMultiSelect() {
    set({ selectedTaskIds: [] })
  },

  async bulkRemove(ids) {
    for (const id of ids) await db.tasks.delete(id)
    set((s) => ({
      tasks: s.tasks.filter((t) => !ids.includes(t.id)),
      selectedTaskIds: [],
      selectedTaskId: ids.includes(s.selectedTaskId ?? '') ? null : s.selectedTaskId,
    }))
  },

  async bulkArchive(ids) {
    const now = Date.now()
    const taskMap = new Map(get().tasks.map((t) => [t.id, t]))
    for (const id of ids) {
      const task = taskMap.get(id)
      if (task) {
        const updated = { ...task, archived: true, updatedAt: now }
        await db.tasks.put(updated)
      }
    }
    set((s) => ({
      tasks: s.tasks.map((t) => ids.includes(t.id) ? { ...t, archived: true, updatedAt: now } : t),
      selectedTaskIds: [],
      selectedTaskId: ids.includes(s.selectedTaskId ?? '') ? null : s.selectedTaskId,
    }))
  },
}))
