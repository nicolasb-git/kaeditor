import { useEffect, useCallback } from 'react'
import { useEditorStore } from './store/editorStore'
import TitleBar from './components/TitleBar/TitleBar'
import TabBar from './components/TabBar/TabBar'
import Sidebar from './components/Sidebar/Sidebar'
import Editor from './components/Editor/Editor'
import StatusBar from './components/StatusBar/StatusBar'
import WelcomeScreen from './components/WelcomeScreen/WelcomeScreen'

export default function App() {
  const { tabs, activeTabId, newTab, openTabs, closeTab, markSaved, toggleSidebar, toggleWordWrap } = useEditorStore()

  const handleOpen = useCallback(async () => {
    const files = await window.api?.file.open()
    if (files) openTabs(files)
  }, [openTabs])

  const handleFolderOpen = useCallback(async () => {
    const result = await window.api?.folder.open()
    if (result) useEditorStore.getState().setOpenFolderPath(result.path, result.tree)
  }, [])

  const handleSave = useCallback(async () => {
    const state = useEditorStore.getState()
    const currentTab = state.tabs.find((t) => t.id === state.activeTabId)
    if (!currentTab) return false

    if (currentTab.filePath) {
      const result = await window.api?.file.save(currentTab.filePath, currentTab.content)
      if (result?.success) {
        state.markSaved(currentTab.id)
        state.refreshFileTree()
        return true
      }
      return false
    } else {
      return await handleSaveAs()
    }
  }, [])

  const handleSaveAs = useCallback(async () => {
    const state = useEditorStore.getState()
    const currentTab = state.tabs.find((t) => t.id === state.activeTabId)
    if (!currentTab) return false

    const result = await window.api?.file.saveAs(currentTab.title, currentTab.content)
    if (result?.success && result.filePath) {
      state.markSaved(currentTab.id, result.filePath)
      state.refreshFileTree()
      return true
    }
    return false
  }, [])

  const handleCloseTab = useCallback(async (id: string) => {
    const state = useEditorStore.getState()
    const tab = state.tabs.find(t => t.id === id)
    if (!tab) return

    const isDirty = tab.content !== tab.savedContent
    if (!isDirty) {
      closeTab(id)
      return
    }

    if (window.api?.file.confirmSave) {
      const choice = await window.api.file.confirmSave(tab.title)
      if (choice === 'save') {
        const saved = await handleSave()
        if (saved) closeTab(id)
      } else if (choice === 'no-save') {
        closeTab(id)
      }
    } else {
      if (window.confirm(`Save changes to ${tab.title}?`)) {
        const saved = await handleSave()
        if (saved) closeTab(id)
      } else {
        closeTab(id)
      }
    }
  }, [handleSave, closeTab])

  // Wire up menu IPC events
  useEffect(() => {
    if (!window.api) return
    
    const unsubs = [
      window.api.menu.onFileNew(() => newTab()),
      window.api.menu.onFileOpen(handleOpen),
      window.api.menu.onFolderOpen(handleFolderOpen),
      window.api.menu.onFileSave(handleSave),
      window.api.menu.onFileSaveAs(handleSaveAs),
      window.api.menu.onTabClose(() => {
        const id = useEditorStore.getState().activeTabId
        if (id) handleCloseTab(id)
      }),
      window.api.menu.onToggleSidebar(() => toggleSidebar()),
      window.api.menu.onToggleWordWrap(() => toggleWordWrap())
    ]

    return () => unsubs.forEach(unsub => unsub())
  }, [newTab, handleOpen, handleFolderOpen, handleSave, handleSaveAs, handleCloseTab, toggleSidebar, toggleWordWrap])

  return (
    <div className="app-layout">
      <TitleBar />
      <TabBar onNewTab={newTab} onOpenFile={handleOpen} onSave={handleSave} onCloseTab={handleCloseTab} />
      <div className="app-body">
        <Sidebar />
        <div className="main-area">
          {tabs.length === 0 ? (
            <WelcomeScreen onNewFile={newTab} onOpenFile={handleOpen} onOpenFolder={handleFolderOpen} />
          ) : (
            <Editor onSave={handleSave} />
          )}
        </div>
      </div>
      <StatusBar />
    </div>
  )
}
