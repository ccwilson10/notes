import { useRef, useEffect } from 'react'
import { Search, X } from 'lucide-react'
import { useAppStore } from '../stores/app'

export function SearchBar() {
  const searchQuery = useAppStore((s) => s.searchQuery)
  const setSearchQuery = useAppStore((s) => s.setSearchQuery)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === '/' && !e.metaKey && !e.ctrlKey && document.activeElement?.tagName !== 'INPUT' && document.activeElement?.tagName !== 'TEXTAREA' && !(document.activeElement as HTMLElement)?.isContentEditable) {
        e.preventDefault()
        inputRef.current?.focus()
      }
      if (e.key === 'Escape' && document.activeElement === inputRef.current) {
        setSearchQuery('')
        inputRef.current?.blur()
      }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [setSearchQuery])

  return (
    <div className="flex items-center gap-2 px-2 py-1 rounded-md bg-surface">
      <Search size={14} className="text-text-secondary shrink-0" />
      <input
        ref={inputRef}
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        placeholder="Search..."
        className="flex-1 text-[13px] text-text bg-transparent border-none outline-none placeholder:text-text-secondary"
      />
      {searchQuery && (
        <button
          onClick={() => { setSearchQuery(''); inputRef.current?.blur() }}
          className="flex items-center justify-center w-5 h-5 rounded text-text-secondary hover:text-text transition-colors duration-150 cursor-pointer"
        >
          <X size={12} />
        </button>
      )}
    </div>
  )
}
