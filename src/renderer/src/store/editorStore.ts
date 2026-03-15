import { create } from 'zustand'

export interface Tab {
  id: string
  filePath: string | null   // null = unsaved new file
  title: string
  content: string
  savedContent: string      // last known saved version
  language: string
  cursorOffset: number
  scrollPosition: { top: number; left: number }
}

interface EditorSettings {
  tabSize: number
  insertSpaces: boolean
}

interface EditorState {
  tabs: Tab[]
  activeTabId: string | null
  sidebarOpen: boolean
  wordWrap: boolean
  fontSize: number
  settings: EditorSettings
  openFolderPath: string | null

  // Actions
  newTab: () => void
  openTabs: (files: { filePath: string; content: string }[]) => void
  closeTab: (id: string) => void
  setActiveTab: (id: string) => void
  updateContent: (id: string, content: string, cursorOffset?: number, scrollPosition?: { top: number; left: number }) => void
  updateSettings: (settings: Partial<EditorSettings>) => void
  markSaved: (id: string, filePath?: string) => void
  toggleSidebar: () => void
  toggleWordWrap: () => void
  setFontSize: (size: number) => void
  setOpenFolderPath: (path: string | null) => void
}

let tabCounter = 0

function newTabId(): string {
  return `tab-${++tabCounter}`
}

function getLanguageFromPath(filePath: string): string {
  const ext = filePath.split('.').pop()?.toLowerCase() ?? ''
  const langMap: Record<string, string> = {
    js: 'javascript', jsx: 'javascript',
    ts: 'typescript', tsx: 'typescript',
    py: 'python',
    rs: 'rust',
    java: 'java',
    cpp: 'cpp', cc: 'cpp', cxx: 'cpp', c: 'c', h: 'c',
    html: 'html', htm: 'html',
    css: 'css',
    json: 'json',
    md: 'markdown', mdx: 'markdown',
    sql: 'sql',
    xml: 'xml', svg: 'xml',
    yaml: 'yaml', yml: 'yaml',
  }
  return langMap[ext] ?? 'text'
}

function getTitleFromPath(filePath: string): string {
  return filePath.split(/[\\/]/).pop() ?? filePath
}

export const useEditorStore = create<EditorState>((set, get) => ({
  tabs: [],
  activeTabId: null,
  sidebarOpen: true,
  wordWrap: false,
  fontSize: 14,
  settings: {
    tabSize: 2,
    insertSpaces: true
  },
  openFolderPath: null,

  newTab: () => {
    const id = newTabId()
    const tab: Tab = {
      id,
      filePath: null,
      title: 'Untitled',
      content: '',
      savedContent: '',
      language: 'text',
      cursorOffset: 0,
      scrollPosition: { top: 0, left: 0 }
    }
    set((s) => ({ tabs: [...s.tabs, tab], activeTabId: id }))
  },

  openTabs: (files) => {
    const { tabs } = get()
    const newTabs: Tab[] = []
    let lastId = get().activeTabId

    for (const { filePath, content } of files) {
      // Don't open the same file twice
      const existing = tabs.find((t) => t.filePath === filePath)
      if (existing) {
        lastId = existing.id
        continue
      }
      const id = newTabId()
      newTabs.push({
        id,
        filePath,
        title: getTitleFromPath(filePath),
        content,
        savedContent: content,
        language: getLanguageFromPath(filePath),
        cursorOffset: 0,
        scrollPosition: { top: 0, left: 0 }
      })
      lastId = id
    }

    set((s) => ({
      tabs: [...s.tabs, ...newTabs],
      activeTabId: lastId ?? s.activeTabId
    }))
  },

  closeTab: (id) => {
    set((s) => {
      const idx = s.tabs.findIndex((t) => t.id === id)
      const newTabs = s.tabs.filter((t) => t.id !== id)
      let newActive = s.activeTabId
      if (s.activeTabId === id) {
        newActive =
          newTabs[Math.min(idx, newTabs.length - 1)]?.id ?? null
      }
      return { tabs: newTabs, activeTabId: newActive }
    })
  },

  setActiveTab: (id) => set({ activeTabId: id }),

  updateContent: (id, content, cursorOffset, scrollPosition) => {
    set((s) => ({
      tabs: s.tabs.map((t) => (t.id === id ? { 
        ...t, 
        content, 
        cursorOffset: cursorOffset ?? t.cursorOffset,
        scrollPosition: scrollPosition ?? t.scrollPosition
      } : t))
    }))
  },

  updateSettings: (newSettings) => {
    set((s) => ({ settings: { ...s.settings, ...newSettings } }))
  },

  markSaved: (id, filePath) => {
    set((s) => ({
      tabs: s.tabs.map((t) => {
        if (t.id !== id) return t
        const fp = filePath ?? t.filePath
        return {
          ...t,
          filePath: fp,
          title: fp ? getTitleFromPath(fp) : t.title,
          savedContent: t.content,
          language: fp ? getLanguageFromPath(fp) : t.language
        }
      })
    }))
  },

  toggleSidebar: () => set((s) => ({ sidebarOpen: !s.sidebarOpen })),
  toggleWordWrap: () => set((s) => ({ wordWrap: !s.wordWrap })),
  setFontSize: (size) => set({ fontSize: size }),
  setOpenFolderPath: (path) => set({ openFolderPath: path })
}))
