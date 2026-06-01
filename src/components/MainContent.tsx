import { useEffect, useState } from 'react'
import { useAppStore } from '../stores/app'
import { useNotesStore } from '../stores/notes'
import { useTasksStore } from '../stores/tasks'
import { useCategoriesStore } from '../stores/categories'
import { NoteList } from './NoteList'
import { NoteDetail } from './NoteDetail'
import { TaskList } from './TaskList'
import { TaskDetail } from './TaskDetail'
import { QuickCapture } from './QuickCapture'
import { SearchBar } from './SearchBar'
import type { View } from '../lib/types'

const viewTitles: Record<View, string> = {
  notes: 'Notes',
  tasks: 'Tasks',
  archive: 'Archive',
}

export function MainContent() {
  const view = useAppStore((s) => s.view)
  const notesLoaded = useNotesStore((s) => s.loaded)
  const loadNotes = useNotesStore((s) => s.load)
  const tasksLoaded = useTasksStore((s) => s.loaded)
  const loadTasks = useTasksStore((s) => s.load)
  const catsLoaded = useCategoriesStore((s) => s.loaded)
  const loadCats = useCategoriesStore((s) => s.load)

  useEffect(() => {
    if (!notesLoaded) loadNotes()
    if (!tasksLoaded) loadTasks()
    if (!catsLoaded) loadCats()
  }, [notesLoaded, loadNotes, tasksLoaded, loadTasks, catsLoaded, loadCats])

  const loaded = notesLoaded && tasksLoaded && catsLoaded

  return (
    <main className="flex-1 flex flex-col min-w-0">
      <div className="flex items-center h-12 px-6 border-b border-border shrink-0 gap-4">
        <h1 className="text-sm font-medium text-text w-16 shrink-0">{viewTitles[view]}</h1>
        <div className="flex-1 max-w-xs">
          <SearchBar />
        </div>
      </div>

      <div className="flex-1 flex min-h-0">
        {!loaded ? (
          <div className="flex-1 flex items-center justify-center">
            <p className="text-text-secondary text-[12px]">Loading...</p>
          </div>
        ) : view === 'archive' ? (
          <ArchiveView />
        ) : view === 'tasks' ? (
          <TasksView />
        ) : (
          <NotesView />
        )}
      </div>
    </main>
  )
}

function NotesView() {
  const selectedNoteId = useNotesStore((s) => s.selectedNoteId)
  const filterCategoryId = useAppStore((s) => s.filterCategoryId)

  const filter = (n: { archived: boolean; categoryId: string | null }) => {
    if (filterCategoryId) return !n.archived && n.categoryId === filterCategoryId
    return !n.archived
  }

  return (
    <>
      <div className="w-72 flex flex-col border-r border-border shrink-0">
        <QuickCapture />
        <NoteList filter={filter} />
      </div>
      <div className="flex-1 flex flex-col min-w-0">
        {selectedNoteId ? (
          <NoteDetail />
        ) : (
          <EmptyState text="Select a note or create one" />
        )}
      </div>
    </>
  )
}

function ArchiveView() {
  const [archiveTab, setArchiveTab] = useState<'notes' | 'tasks'>('notes')
  const selectedNoteId = useNotesStore((s) => s.selectedNoteId)
  const selectedTaskId = useTasksStore((s) => s.selectedTaskId)

  return (
    <>
      <div className="w-72 flex flex-col border-r border-border shrink-0">
        <div className="flex items-center gap-1 px-3 h-[53px] border-b border-border shrink-0">
          <button
            onClick={() => setArchiveTab('notes')}
            className={`px-2.5 py-1 text-[12px] rounded-md cursor-pointer transition-colors duration-150 ${
              archiveTab === 'notes'
                ? 'bg-surface-hover text-text font-medium'
                : 'text-text-secondary hover:bg-surface'
            }`}
          >
            Notes
          </button>
          <button
            onClick={() => setArchiveTab('tasks')}
            className={`px-2.5 py-1 text-[12px] rounded-md cursor-pointer transition-colors duration-150 ${
              archiveTab === 'tasks'
                ? 'bg-surface-hover text-text font-medium'
                : 'text-text-secondary hover:bg-surface'
            }`}
          >
            Tasks
          </button>
        </div>
        {archiveTab === 'notes' ? (
          <NoteList filter={(n) => n.archived} />
        ) : (
          <TaskList filter={(t) => t.archived} />
        )}
      </div>
      <div className="flex-1 flex flex-col min-w-0">
        {archiveTab === 'notes' ? (
          selectedNoteId ? <NoteDetail /> : <EmptyState text="Select an archived note" />
        ) : (
          selectedTaskId ? <TaskDetail /> : <EmptyState text="Select an archived task" />
        )}
      </div>
    </>
  )
}

function TasksView() {
  const selectedTaskId = useTasksStore((s) => s.selectedTaskId)

  return (
    <>
      <div className="w-72 flex flex-col border-r border-border shrink-0">
        <QuickCapture mode="tasks" />
        <TaskList />
      </div>
      <div className="flex-1 flex flex-col min-w-0">
        {selectedTaskId ? (
          <TaskDetail />
        ) : (
          <EmptyState text="Select a task or create one" />
        )}
      </div>
    </>
  )
}

function EmptyState({ text }: { text: string }) {
  return (
    <div className="flex-1 flex items-start justify-center pt-[40%]">
      <p className="text-text-secondary text-[12px]">{text}</p>
    </div>
  )
}
