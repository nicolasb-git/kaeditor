import { ipcMain, dialog, BrowserWindow } from 'electron'
import { readFile, writeFile, readdir, stat } from 'fs/promises'
import { existsSync } from 'fs'
import { join, basename } from 'path'

export interface FileNode {
  name: string
  path: string
  isDirectory: boolean
  children?: FileNode[]
}

async function readDirectory(dirPath: string): Promise<FileNode[]> {
  const files = await readdir(dirPath, { withFileTypes: true })
  
  const nodes = await Promise.all(
    files.map(async (file) => {
      try {
        const fullPath = join(dirPath, file.name)
        const isDirectory = file.isDirectory()
        
        const node: FileNode = {
          name: file.name,
          path: fullPath,
          isDirectory
        }
        
        if (isDirectory) {
          if (file.name !== 'node_modules' && file.name !== '.git' && file.name !== 'dist' && file.name !== 'out') {
            node.children = await readDirectory(fullPath)
          }
        }
        
        return node
      } catch (err) {
        console.error(`Failed to read ${file.name}:`, err)
        return {
          name: file.name,
          path: join(dirPath, file.name),
          isDirectory: file.isDirectory()
        }
      }
    })
  )
  
  // Sort: directories first, then alphabetical
  return nodes.sort((a, b) => {
    if (a.isDirectory === b.isDirectory) {
      return a.name.localeCompare(b.name)
    }
    return a.isDirectory ? -1 : 1
  })
}

export function setupIpcHandlers(): void {
  // Open file dialog
  ipcMain.handle('file:open', async () => {
    let win = BrowserWindow.getFocusedWindow()
    if (!win) {
      const allWindows = BrowserWindow.getAllWindows()
      if (allWindows.length > 0) win = allWindows[0]
    }
    if (!win) return null

    const result = await dialog.showOpenDialog(win, {
      properties: ['openFile', 'multiSelections'],
      filters: [
        {
          name: 'All Files',
          extensions: ['*']
        },
        {
          name: 'Text Files',
          extensions: ['txt', 'md', 'json', 'js', 'ts', 'jsx', 'tsx', 'html', 'css', 'py', 'rs', 'java', 'cpp', 'c', 'h', 'sql', 'xml', 'yaml', 'yml']
        }
      ]
    })

    if (result.canceled || result.filePaths.length === 0) return null

    const files = await Promise.all(
      result.filePaths.map(async (filePath) => {
        const content = await readFile(filePath, 'utf-8')
        return { filePath, content }
      })
    )

    return files
  })

  // Read a specific file
  ipcMain.handle('file:read', async (_, filePath: string) => {
    try {
      const content = await readFile(filePath, 'utf-8')
      return { success: true, content }
    } catch (err) {
      return { success: false, error: String(err) }
    }
  })

  // Save file
  ipcMain.handle('file:save', async (_, filePath: string, content: string) => {
    try {
      await writeFile(filePath, content, 'utf-8')
      return { success: true }
    } catch (err) {
      return { success: false, error: String(err) }
    }
  })

  // Save As dialog
  ipcMain.handle('file:saveAs', async (_, defaultName: string, content: string) => {
    const win = BrowserWindow.getFocusedWindow()
    if (!win) return null

    const result = await dialog.showSaveDialog(win, {
      defaultPath: defaultName,
      filters: [
        { name: 'All Files', extensions: ['*'] },
        { name: 'Text Files', extensions: ['txt', 'md'] }
      ]
    })

    if (result.canceled || !result.filePath) return null

    try {
      await writeFile(result.filePath, content, 'utf-8')
      return { success: true, filePath: result.filePath }
    } catch (err) {
      return { success: false, error: String(err) }
    }
  })

  // Open folder dialog
  ipcMain.handle('folder:open', async () => {
    let win = BrowserWindow.getFocusedWindow()
    if (!win) {
      const allWindows = BrowserWindow.getAllWindows()
      if (allWindows.length > 0) win = allWindows[0]
    }
    if (!win) return null

    const result = await dialog.showOpenDialog(win, {
      properties: ['openDirectory']
    })

    if (result.canceled || result.filePaths.length === 0) return null
    const folderPath = result.filePaths[0]
    const tree = await readDirectory(folderPath)
    
    return { path: folderPath, tree }
  })

  // Read folder contents explicitly
  ipcMain.handle('folder:read', async (_, folderPath: string) => {
    try {
      const tree = await readDirectory(folderPath)
      return { success: true, tree }
    } catch (err) {
      return { success: false, error: String(err) }
    }
  })

  // Close confirmation dialog
  ipcMain.handle('file:confirmSave', async (_, fileName: string) => {
    console.log('[IPC] file:confirmSave called for:', fileName)
    let win = BrowserWindow.getFocusedWindow()
    if (!win) {
      const allWindows = BrowserWindow.getAllWindows()
      if (allWindows.length > 0) win = allWindows[0]
    }
    
    if (!win) {
      console.error('[IPC] No window found for dialog')
      return 'cancel'
    }

    try {
      const { response } = await dialog.showMessageBox(win, {
        type: 'warning',
        buttons: ['Save', "Don't Save", 'Cancel'],
        defaultId: 0,
        cancelId: 2,
        title: 'Unsaved Changes',
        message: `Do you want to save the changes you made to ${fileName}?`,
        detail: "Your changes will be lost if you don't save them.",
        noLink: true
      })

      const results: ('save' | 'no-save' | 'cancel')[] = ['save', 'no-save', 'cancel']
      console.log('[IPC] User choice:', results[response])
      return results[response]
    } catch (err) {
      console.error('[IPC] Error in confirmSave dialog:', err)
      return 'cancel'
    }
  })

  // Check if file exists
  ipcMain.handle('file:exists', async (_, filePath: string) => {
    return existsSync(filePath)
  })
}
