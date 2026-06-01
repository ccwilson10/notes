import { openDB, type DBSchema } from 'idb'
import type { Note, Task, Category } from './types'

interface NotesDB extends DBSchema {
  notes: { key: string; value: Note; indexes: { 'by-updated': number } }
  tasks: { key: string; value: Task; indexes: { 'by-updated': number } }
  categories: { key: string; value: Category }
}

const dbPromise = openDB<NotesDB>('notes-app', 1, {
  upgrade(db) {
    const noteStore = db.createObjectStore('notes', { keyPath: 'id' })
    noteStore.createIndex('by-updated', 'updatedAt')

    const taskStore = db.createObjectStore('tasks', { keyPath: 'id' })
    taskStore.createIndex('by-updated', 'updatedAt')

    db.createObjectStore('categories', { keyPath: 'id' })
  },
})

export const db = {
  notes: {
    async getAll(): Promise<Note[]> {
      return (await dbPromise).getAll('notes')
    },
    async put(note: Note): Promise<void> {
      await (await dbPromise).put('notes', note)
    },
    async delete(id: string): Promise<void> {
      await (await dbPromise).delete('notes', id)
    },
  },
  tasks: {
    async getAll(): Promise<Task[]> {
      return (await dbPromise).getAll('tasks')
    },
    async put(task: Task): Promise<void> {
      await (await dbPromise).put('tasks', task)
    },
    async delete(id: string): Promise<void> {
      await (await dbPromise).delete('tasks', id)
    },
  },
  categories: {
    async getAll(): Promise<Category[]> {
      return (await dbPromise).getAll('categories')
    },
    async put(category: Category): Promise<void> {
      await (await dbPromise).put('categories', category)
    },
    async delete(id: string): Promise<void> {
      await (await dbPromise).delete('categories', id)
    },
  },
}
