export type AccentColor = 'red' | 'amber' | 'green' | 'blue' | 'purple'

export type Note = {
  id: string
  title: string
  body: string
  categoryId: string | null
  pinned: boolean
  archived: boolean
  createdAt: number
  updatedAt: number
}

export type Task = {
  id: string
  title: string
  body: string
  categoryId: string | null
  completed: boolean
  completedAt: number | null
  dueDate: string | null
  priority: 'low' | 'medium' | 'high' | null
  pinned: boolean
  archived: boolean
  createdAt: number
  updatedAt: number
}

export type Category = {
  id: string
  name: string
  color: AccentColor
  sortOrder: number
}

export type View = 'notes' | 'tasks' | 'archive'
