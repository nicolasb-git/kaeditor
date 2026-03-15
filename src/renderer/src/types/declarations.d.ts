declare module '*.module.css' {
  const classes: { [key: string]: string }
  export default classes
}

declare module '*.css' {
  const content: string
  export default content
}

declare module '*.svg' {
  const content: string
  export default content
}

declare module '*.png' {
  const content: string
  export default content
}

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

export {}
