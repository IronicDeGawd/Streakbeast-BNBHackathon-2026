import { app, BrowserWindow, shell, ipcMain } from 'electron'
import { join, resolve } from 'path'
import { existsSync, mkdirSync, cpSync } from 'fs'
import { homedir } from 'os'

const isDev = !app.isPackaged
const oauthTokens: Record<string, string> = {}

let mainWindow: BrowserWindow | null = null

function createWindow(): void {
  mainWindow = new BrowserWindow({
    width: 960,
    height: 640,
    useContentSize: true,
    minWidth: 960,
    minHeight: 640,
    show: false,
    autoHideMenuBar: true,
    backgroundColor: '#251838',
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      sandbox: false,
      nodeIntegration: false,
      contextIsolation: true
    }
  })

  // Lock aspect ratio to 960:640 (3:2) so the window scales proportionally
  mainWindow.setAspectRatio(960 / 640)

  mainWindow.on('ready-to-show', () => {
    mainWindow?.show()
    // Log initial size
    const [w, h] = mainWindow!.getSize()
    const [cw, ch] = mainWindow!.getContentSize()
    console.log(`[WindowSize] Initial  → window: ${w}x${h}  content: ${cw}x${ch}`)
  })

  mainWindow.on('resize', () => {
    const [w, h] = mainWindow!.getSize()
    const [cw, ch] = mainWindow!.getContentSize()
    console.log(`[WindowSize] Resized  → window: ${w}x${h}  content: ${cw}x${ch}`)
  })

  mainWindow.webContents.setWindowOpenHandler((details) => {
    shell.openExternal(details.url)
    return { action: 'deny' }
  })

  if (isDev && process.env['ELECTRON_RENDERER_URL']) {
    mainWindow.loadURL(process.env['ELECTRON_RENDERER_URL'])
  } else {
    mainWindow.loadFile(join(__dirname, '../renderer/index.html'))
  }
}

// Register streakbeast:// custom protocol for OAuth callbacks
if (process.defaultApp) {
  if (process.argv.length >= 2) {
    app.setAsDefaultProtocolClient('streakbeast', process.execPath, [resolve(process.argv[1]!)])
  }
} else {
  app.setAsDefaultProtocolClient('streakbeast')
}

// Single instance lock — forward protocol URLs on Windows
const gotTheLock = app.requestSingleInstanceLock()
if (!gotTheLock) {
  app.quit()
} else {
  app.on('second-instance', (_event, commandLine) => {
    const url = commandLine.find(arg => arg.startsWith('streakbeast://'))
    if (url && mainWindow) {
      mainWindow.webContents.send('oauth:callback', url)
      mainWindow.focus()
    }
  })
}

// macOS: handle protocol URL via open-url event
app.on('open-url', (event, url) => {
  event.preventDefault()
  if (mainWindow) {
    mainWindow.webContents.send('oauth:callback', url)
    mainWindow.focus()
  }
})

/** Copy bundled skill to ~/.openclaw/skills/streakbeast if not already present */
function installSkill(): void {
  const dest = join(homedir(), '.openclaw', 'skills', 'streakbeast')
  if (existsSync(join(dest, 'SKILL.md'))) return // already installed

  const src = isDev
    ? resolve(__dirname, '..', '..', '..', '..', 'skill')
    : join(process.resourcesPath, 'skill')

  if (!existsSync(join(src, 'SKILL.md'))) {
    console.warn('[Skill] Source skill not found at', src)
    return
  }

  try {
    mkdirSync(dest, { recursive: true })
    cpSync(src, dest, { recursive: true })
    console.log('[Skill] Installed streakbeast skill to', dest)
  } catch (e) {
    console.error('[Skill] Failed to install skill:', e)
  }
}

app.whenReady().then(() => {
  app.setAppUserModelId?.('com.streakbeast')
  installSkill()

  createWindow()

  // OAuth IPC handlers
  ipcMain.handle('oauth:open-url', async (_event, url: string) => {
    await shell.openExternal(url)
    return true
  })

  ipcMain.handle('oauth:store-token', async (_event, provider: string, token: string) => {
    oauthTokens[provider] = token
    return true
  })

  ipcMain.handle('oauth:get-token', async (_event, provider: string) => {
    return oauthTokens[provider] || null
  })

  app.on('activate', function () {
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})