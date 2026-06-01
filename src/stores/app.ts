import { create } from 'zustand'
import type { View } from '../lib/types'

type AppState = {
  view: View
  sidebarOpen: boolean
  filterCategoryId: string | null
  searchQuery: string
  setView: (view: View) => void
  toggleSidebar: () => void
  setFilterCategory: (id: string | null) => void
  setSearchQuery: (query: string) => void
}

export const useAppStore = create<AppState>((set) => ({
  view: 'notes',
  sidebarOpen: true,
  filterCategoryId: null,
  searchQuery: '',
  setView: (view) => set({ view, filterCategoryId: null, searchQuery: '' }),
  toggleSidebar: () => set((s) => ({ sidebarOpen: !s.sidebarOpen })),
  setFilterCategory: (id) => set((s) => ({
    filterCategoryId: s.filterCategoryId === id ? null : id,
  })),
  setSearchQuery: (searchQuery) => set({ searchQuery }),
}))
