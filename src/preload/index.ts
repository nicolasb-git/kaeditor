import { contextBridge, ipcRenderer } from 'electron'

// Expose safe file system API to renderer
contextBridge.exposeInMainWorld('api', {
  // File operations
  file: {
    open: () => ipcRenderer.invoke('file:open'),
    read: (filePath: string) => ipcRenderer.invoke('file:read', filePath),
    save: (filePath: string, content: string) => ipcRenderer.invoke('file:save', filePath, content),
    saveAs: (defaultName: string, content: string) =>
      ipcRenderer.invoke('file:saveAs', defaultName, content),
    exists: (filePath: string) => ipcRenderer.invoke('file:exists', filePath)
  },

  // Folder operations
  folder: {
    open: () => ipcRenderer.invoke('folder:open')
  },

  // Window controls
  window: {
    minimize: () => ipcRenderer.send('window:minimize'),
    maximize: () => ipcRenderer.send('window:maximize'),
    close: () => ipcRenderer.send('window:close'),
    onMaximized: (cb: (isMaximized: boolean) => void) => {
      ipcRenderer.on('window:maximized', (_, val) => cb(val))
    }
  },

  // Menu event listeners
  menu: {
    onFileNew: (cb: () => void) => {
      const l = () => cb()
      ipcRenderer.on('menu:file:new', l)
      return () => ipcRenderer.removeListener('menu:file:new', l)
    },
    onFileOpen: (cb: () => void) => {
      const l = () => cb()
      ipcRenderer.on('menu:file:open', l)
      return () => ipcRenderer.removeListener('menu:file:open', l)
    },
    onFolderOpen: (cb: () => void) => {
      const l = () => cb()
      ipcRenderer.on('menu:folder:open', l)
      return () => ipcRenderer.removeListener('menu:folder:open', l)
    },
    onFileSave: (cb: () => void) => {
      const l = () => cb()
      ipcRenderer.on('menu:file:save', l)
      return () => ipcRenderer.removeListener('menu:file:save', l)
    },
    onFileSaveAs: (cb: () => void) => {
      const l = () => cb()
      ipcRenderer.on('menu:file:saveAs', l)
      return () => ipcRenderer.removeListener('menu:file:saveAs', l)
    },
    onTabClose: (cb: () => void) => {
      const l = () => cb()
      ipcRenderer.on('menu:tab:close', l)
      return () => ipcRenderer.removeListener('menu:tab:close', l)
    },
    onFind: (cb: () => void) => {
      const l = () => cb()
      ipcRenderer.on('menu:edit:find', l)
      return () => ipcRenderer.removeListener('menu:edit:find', l)
    },
    onReplace: (cb: () => void) => {
      const l = () => cb()
      ipcRenderer.on('menu:edit:replace', l)
      return () => ipcRenderer.removeListener('menu:edit:replace', l)
    },
    onGotoLine: (cb: () => void) => {
      const l = () => cb()
      ipcRenderer.on('menu:edit:gotoLine', l)
      return () => ipcRenderer.removeListener('menu:edit:gotoLine', l)
    },
    onToggleSidebar: (cb: () => void) => {
      const l = () => cb()
      ipcRenderer.on('menu:view:toggleSidebar', l)
      return () => ipcRenderer.removeListener('menu:view:toggleSidebar', l)
    },
    onToggleWordWrap: (cb: () => void) => {
      const l = () => cb()
      ipcRenderer.on('menu:view:toggleWordWrap', l)
      return () => ipcRenderer.removeListener('menu:view:toggleWordWrap', l)
    },
    onAbout: (cb: () => void) => {
      const l = () => cb()
      ipcRenderer.on('menu:help:about', l)
      return () => ipcRenderer.removeListener('menu:help:about', l)
    }
  }
})
