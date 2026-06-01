import { create } from 'zustand'
import { nanoid } from 'nanoid'
import { db } from '../lib/db'
import type { AccentColor, Category } from '../lib/types'

type CategoriesState = {
  categories: Category[]
  loaded: boolean
  load: () => Promise<void>
  create: (name: string, color: AccentColor) => Promise<Category>
  update: (id: string, changes: Partial<Pick<Category, 'name' | 'color' | 'sortOrder'>>) => Promise<void>
  remove: (id: string) => Promise<void>
}

const colorCycle: AccentColor[] = ['blue', 'green', 'amber', 'red', 'purple']

export const useCategoriesStore = create<CategoriesState>((set, get) => ({
  categories: [],
  loaded: false,

  async load() {
    const categories = await db.categories.getAll()
    set({ categories: categories.sort((a, b) => a.sortOrder - b.sortOrder), loaded: true })
  },

  async create(name, color?) {
    const cats = get().categories
    const nextColor = color ?? colorCycle[cats.length % colorCycle.length]
    const category: Category = {
      id: nanoid(),
      name,
      color: nextColor,
      sortOrder: cats.length,
    }
    await db.categories.put(category)
    set((s) => ({ categories: [...s.categories, category] }))
    return category
  },

  async update(id, changes) {
    const cat = get().categories.find((c) => c.id === id)
    if (!cat) return
    const updated = { ...cat, ...changes }
    await db.categories.put(updated)
    set((s) => ({
      categories: s.categories.map((c) => (c.id === id ? updated : c)),
    }))
  },

  async remove(id) {
    await db.categories.delete(id)
    set((s) => ({
      categories: s.categories.filter((c) => c.id !== id),
    }))
  },
}))
