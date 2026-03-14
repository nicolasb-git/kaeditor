import { useEffect } from 'react'
import { useEditorStore } from './store/editorStore'
import TitleBar from './components/TitleBar/TitleBar'
import TabBar from './components/TabBar/TabBar'
import Sidebar from './components/Sidebar/Sidebar'
import Editor from './components/Editor/Editor'
import StatusBar from './components/StatusBar/StatusBar'
import WelcomeScreen from './components/WelcomeScreen/WelcomeScreen'

declare global {
  interface Window {
    api: {
      file: {
        open: () => Promise<{ filePath: string; content: string }[] | null>
        read: (filePath: string) => Promise<{ success: boolean; content?: string; error?: string }>
        save: (filePath: string, content: string) => Promise<{ success: boolean; error?: string }>
        saveAs: (defaultName: string, content: string) => Promise<{ success: boolean; filePath?: string; error?: string } | null>
        exists: (filePath: string) => Promise<boolean>
      }
      folder: {
        open: () => Promise<string | null>
      }
      window: {
        minimize: () => void
        maximize: () => void
        close: () => void
        onMaximized: (cb: (isMaximized: boolean) => void) => void
      }
      menu: {
        onFileNew: (cb: () => void) => () => void
        onFileOpen: (cb: () => void) => () => void
        onFolderOpen: (cb: () => void) => () => void
        onFileSave: (cb: () => void) => () => void
        onFileSaveAs: (cb: () => void) => () => void
        onTabClose: (cb: () => void) => () => void
        onFind: (cb: () => void) => () => void
        onReplace: (cb: () => void) => () => void
        onGotoLine: (cb: () => void) => () => void
        onToggleSidebar: (cb: () => void) => () => void
        onToggleWordWrap: (cb: () => void) => () => void
        onAbout: (cb: () => void) => () => void
      }
    }
  }
}

export default function App() {
  const { tabs, activeTabId, newTab, openTabs, closeTab, markSaved, toggleSidebar, toggleWordWrap } = useEditorStore()

  const activeTab = tabs.find((t) => t.id === activeTabId) ?? null

  // Wire up menu IPC events (only in Electron context)
  useEffect(() => {
    if (!window.api) return
    
    // Use cleanup functions to prevent duplicate listeners
    const unsubs = [
      window.api.menu.onFileNew(() => newTab()),
      window.api.menu.onFileOpen(handleOpen),
      window.api.menu.onFolderOpen(handleFolderOpen),
      window.api.menu.onFileSave(handleSave),
      window.api.menu.onFileSaveAs(handleSaveAs),
      window.api.menu.onTabClose(() => activeTabId && closeTab(activeTabId)),
      window.api.menu.onToggleSidebar(() => toggleSidebar()),
      window.api.menu.onToggleWordWrap(() => toggleWordWrap())
    ]

    return () => {
      unsubs.forEach(unsub => unsub())
    }
  }, [activeTabId])

  async function handleOpen() {
    const files = await window.api?.file.open()
    if (files) openTabs(files)
  }

  async function handleFolderOpen() {
    const folderPath = await window.api?.folder.open()
    if (folderPath) useEditorStore.getState().setOpenFolderPath(folderPath)
  }

  // Use getState() inside handlers to ensure we have the LATEST state
  // This prevents stale closures from causing multiple "Save As" prompts
  async function handleSave() {
    const state = useEditorStore.getState()
    const currentTab = state.tabs.find((t) => t.id === state.activeTabId)
    if (!currentTab) return

    if (currentTab.filePath) {
      await window.api?.file.save(currentTab.filePath, currentTab.content)
      state.markSaved(currentTab.id)
    } else {
      await handleSaveAs()
    }
  }

  async function handleSaveAs() {
    const state = useEditorStore.getState()
    const currentTab = state.tabs.find((t) => t.id === state.activeTabId)
    if (!currentTab) return

    const result = await window.api?.file.saveAs(currentTab.title, currentTab.content)
    if (result?.success && result.filePath) {
      state.markSaved(currentTab.id, result.filePath)
    }
  }

  return (
    <div className="app-layout">
      <TitleBar />
      <TabBar onNewTab={newTab} onOpenFile={handleOpen} onSave={handleSave} />
      <div className="app-body">
        <Sidebar />
        <div className="main-area">
          {tabs.length === 0 ? (
            <WelcomeScreen onNewFile={newTab} onOpenFile={handleOpen} />
          ) : (
            <Editor onSave={handleSave} />
          )}
        </div>
      </div>
      <StatusBar />
    </div>
  )
}
