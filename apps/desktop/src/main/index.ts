import { app, BrowserWindow, shell } from 'electron'
import { join } from 'path'

const isDev = !app.isPackaged

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

app.whenReady().then(() => {
  app.setAppUserModelId?.('com.streakbeast')

  createWindow()

  app.on('activate', function () {
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.