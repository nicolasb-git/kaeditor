import { Menu, BrowserWindow, app } from 'electron'

export function buildMenu(win: BrowserWindow): Menu {
  const isMac = process.platform === 'darwin'

  const template: Electron.MenuItemConstructorOptions[] = [
    ...(isMac ? [{ role: 'appMenu' as const }] : []),
    {
      label: 'File',
      submenu: [
        {
          label: 'New File',
          accelerator: 'CmdOrCtrl+N',
          click: () => win.webContents.send('menu:file:new')
        },
        {
          label: 'Open File...',
          accelerator: 'CmdOrCtrl+O',
          click: () => win.webContents.send('menu:file:open')
        },
        {
          label: 'Open Folder...',
          accelerator: 'CmdOrCtrl+Shift+O',
          click: () => win.webContents.send('menu:folder:open')
        },
        { type: 'separator' },
        {
          label: 'Save',
          accelerator: 'CmdOrCtrl+S',
          click: () => win.webContents.send('menu:file:save')
        },
        {
          label: 'Save As...',
          accelerator: 'CmdOrCtrl+Shift+S',
          click: () => win.webContents.send('menu:file:saveAs')
        },
        { type: 'separator' },
        {
          label: 'Close Tab',
          accelerator: 'CmdOrCtrl+W',
          click: () => win.webContents.send('menu:tab:close')
        },
        { type: 'separator' },
        isMac ? { role: 'close' as const } : { role: 'quit' as const }
      ]
    },
    {
      label: 'Edit',
      submenu: [
        { role: 'undo' as const },
        { role: 'redo' as const },
        { type: 'separator' },
        { role: 'cut' as const },
        { role: 'copy' as const },
        { role: 'paste' as const },
        { role: 'selectAll' as const },
        { type: 'separator' },
        {
          label: 'Find',
          accelerator: 'CmdOrCtrl+F',
          click: () => win.webContents.send('menu:edit:find')
        },
        {
          label: 'Replace',
          accelerator: 'CmdOrCtrl+H',
          click: () => win.webContents.send('menu:edit:replace')
        },
        {
          label: 'Go to Line...',
          accelerator: 'CmdOrCtrl+G',
          click: () => win.webContents.send('menu:edit:gotoLine')
        }
      ]
    },
    {
      label: 'View',
      submenu: [
        {
          label: 'Toggle Sidebar',
          accelerator: 'CmdOrCtrl+B',
          click: () => win.webContents.send('menu:view:toggleSidebar')
        },
        {
          label: 'Toggle Word Wrap',
          accelerator: 'Alt+Z',
          click: () => win.webContents.send('menu:view:toggleWordWrap')
        },
        { type: 'separator' },
        { role: 'zoomIn' as const },
        { role: 'zoomOut' as const },
        { role: 'resetZoom' as const },
        { type: 'separator' },
        { role: 'togglefullscreen' as const },
        ...(process.env.NODE_ENV === 'development' ? [{ role: 'toggleDevTools' as const }] : [])
      ]
    },
    {
      label: 'Help',
      submenu: [
        {
          label: 'About Kaeditor',
          click: () => win.webContents.send('menu:help:about')
        }
      ]
    }
  ]

  return Menu.buildFromTemplate(template)
}
