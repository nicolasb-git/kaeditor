import { ipcMain, dialog, BrowserWindow } from 'electron'
import { readFile, writeFile } from 'fs/promises'
import { existsSync } from 'fs'

export function setupIpcHandlers(): void {
  // Open file dialog
  ipcMain.handle('file:open', async () => {
    const win = BrowserWindow.getFocusedWindow()
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
    const win = BrowserWindow.getFocusedWindow()
    if (!win) return null

    const result = await dialog.showOpenDialog(win, {
      properties: ['openDirectory']
    })

    if (result.canceled || result.filePaths.length === 0) return null
    return result.filePaths[0]
  })

  // Check if file exists
  ipcMain.handle('file:exists', async (_, filePath: string) => {
    return existsSync(filePath)
  })
}
