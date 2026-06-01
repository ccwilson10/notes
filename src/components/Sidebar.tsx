import { useState, type KeyboardEvent } from 'react'
import { FileText, CheckSquare, Archive, PanelLeftClose, PanelLeft, Plus, X } from 'lucide-react'
import { useAppStore } from '../stores/app'
import { useCategoriesStore } from '../stores/categories'
import { CategoryDot } from './CategoryDot'
import { allColors } from '../lib/colors'
import type { View, AccentColor } from '../lib/types'

const navItems: { view: View; label: string; icon: typeof FileText }[] = [
  { view: 'notes', label: 'Notes', icon: FileText },
  { view: 'tasks', label: 'Tasks', icon: CheckSquare },
  { view: 'archive', label: 'Archive', icon: Archive },
]

export function Sidebar() {
  const { view, setView, sidebarOpen, toggleSidebar, filterCategoryId, setFilterCategory } = useAppStore()
  const categories = useCategoriesStore((s) => s.categories)
  const createCategory = useCategoriesStore((s) => s.create)
  const removeCategory = useCategoriesStore((s) => s.remove)

  const [adding, setAdding] = useState(false)
  const [newName, setNewName] = useState('')
  const [newColor, setNewColor] = useState<AccentColor>('blue')

  const handleAddCategory = async () => {
    const trimmed = newName.trim()
    if (!trimmed) { setAdding(false); return }
    await createCategory(trimmed, newColor)
    setNewName('')
    setAdding(false)
    setNewColor(allColors[(categories.length + 1) % allColors.length])
  }

  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === 'Enter') handleAddCategory()
    if (e.key === 'Escape') { setAdding(false); setNewName('') }
  }

  return (
    <aside
      className={`flex flex-col border-r border-border bg-surface overflow-hidden ${
        sidebarOpen ? 'w-52' : 'w-12'
      }`}
      style={{ transition: 'width 250ms cubic-bezier(0.4, 0, 0.2, 1)' }}
    >
      <div className="flex items-center h-12 px-3 justify-between">
        <span
          className="text-sm font-medium text-icon select-none whitespace-nowrap overflow-hidden"
          style={{
            opacity: sidebarOpen ? 1 : 0,
            width: sidebarOpen ? 'auto' : 0,
            transition: 'opacity 200ms ease, width 200ms ease',
          }}
        >
          Notes
        </span>
        <button
          onClick={toggleSidebar}
          className="flex items-center justify-center w-7 h-7 shrink-0 rounded-md text-icon hover:bg-surface-hover transition-colors duration-150 cursor-pointer"
        >
          {sidebarOpen ? <PanelLeftClose size={16} /> : <PanelLeft size={16} />}
        </button>
      </div>

      <nav className="flex flex-col gap-0.5 px-2 mt-1">
        {navItems.map(({ view: v, label, icon: Icon }) => {
          const active = view === v && !filterCategoryId
          return (
            <button
              key={v}
              onClick={() => setView(v)}
              className={`flex items-center gap-2.5 h-8 px-2.5 rounded-md transition-colors duration-150 cursor-pointer ${
                active
                  ? 'bg-surface-hover text-text'
                  : 'text-text-secondary hover:bg-surface-hover hover:text-text'
              }`}
            >
              <Icon size={16} className="shrink-0" strokeWidth={active ? 2 : 1.5} />
              <span
                className="text-[13px] whitespace-nowrap overflow-hidden"
                style={{
                  opacity: sidebarOpen ? 1 : 0,
                  width: sidebarOpen ? 'auto' : 0,
                  transition: 'opacity 200ms ease, width 200ms ease',
                }}
              >
                {label}
              </span>
            </button>
          )
        })}
      </nav>

      {sidebarOpen && (
        <div className="mt-6 px-2">
          <div className="flex items-center justify-between px-2.5 mb-1">
            <span className="text-[11px] font-medium text-text-secondary uppercase tracking-wide">Categories</span>
            <button
              onClick={() => setAdding(true)}
              className="flex items-center justify-center w-5 h-5 rounded text-text-tertiary hover:text-text-secondary transition-colors duration-150 cursor-pointer"
            >
              <Plus size={12} />
            </button>
          </div>

          <div className="flex flex-col gap-0.5">
            {categories.map((cat) => {
              const active = filterCategoryId === cat.id
              return (
                <div key={cat.id} className="group flex items-center">
                  <button
                    onClick={() => setFilterCategory(cat.id)}
                    className={`flex-1 flex items-center gap-2 h-7 px-2.5 rounded-md transition-colors duration-150 cursor-pointer ${
                      active
                        ? 'bg-surface-hover text-text'
                        : 'text-text-secondary hover:bg-surface-hover hover:text-text'
                    }`}
                  >
                    <CategoryDot color={cat.color} size={7} />
                    <span className="text-[12px] truncate">{cat.name}</span>
                  </button>
                  <button
                    onClick={() => {
                      if (filterCategoryId === cat.id) setFilterCategory(null)
                      removeCategory(cat.id)
                    }}
                    className="hidden group-hover:flex items-center justify-center w-5 h-5 rounded text-text-tertiary hover:text-accent-red transition-colors duration-150 cursor-pointer"
                  >
                    <X size={11} />
                  </button>
                </div>
              )
            })}

            {adding && (
              <div className="flex items-center gap-1.5 px-2.5 h-7">
                <button
                  onClick={() => setNewColor(allColors[(allColors.indexOf(newColor) + 1) % allColors.length])}
                  className="cursor-pointer shrink-0"
                >
                  <CategoryDot color={newColor} size={7} />
                </button>
                <input
                  autoFocus
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  onKeyDown={handleKeyDown}
                  onBlur={handleAddCategory}
                  placeholder="Name..."
                  className="flex-1 text-[12px] text-text bg-transparent border-none outline-none placeholder:text-text-tertiary min-w-0"
                />
              </div>
            )}
          </div>
        </div>
      )}
    </aside>
  )
}
