import { useEffect } from 'react'
import { useAppStore } from '../stores/app'
import { useNotesStore } from '../stores/notes'
import { useTasksStore } from '../stores/tasks'

export function useKeyboardShortcuts() {
  const setView = useAppStore((s) => s.setView)
  const createNote = useNotesStore((s) => s.create)
  const createTask = useTasksStore((s) => s.create)

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const el = document.activeElement
      const tag = el?.tagName
      if (tag === 'INPUT' || tag === 'TEXTAREA' || (el as HTMLElement)?.isContentEditable) return

      if (e.key === 'n' && !e.metaKey && !e.ctrlKey) {
        e.preventDefault()
        setView('notes')
        createNote('')
      }

      if (e.key === 't' && !e.metaKey && !e.ctrlKey) {
        e.preventDefault()
        setView('tasks')
        createTask('')
      }
    }

    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [setView, createNote, createTask])
}
