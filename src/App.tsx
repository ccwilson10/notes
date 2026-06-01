import { Sidebar } from './components/Sidebar'
import { MainContent } from './components/MainContent'
import { useKeyboardShortcuts } from './lib/useKeyboardShortcuts'

function App() {
  useKeyboardShortcuts()

  return (
    <>
      <Sidebar />
      <MainContent />
    </>
  )
}

export default App
