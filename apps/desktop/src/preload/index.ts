import { contextBridge, ipcRenderer } from 'electron'
import { electronAPI } from '@electron-toolkit/preload'

// Custom APIs for renderer
const api = {
  platform: process.platform,
  versions: {
    node: process.versions.node,
    chrome: process.versions.chrome,
    electron: process.versions.electron
  },
  oauth: {
    openUrl: (url: string) => ipcRenderer.invoke('oauth:open-url', url),
    onCallback: (callback: (url: string) => void) => {
      const handler = (_event: Electron.IpcRendererEvent, url: string) => callback(url)
      ipcRenderer.on('oauth:callback', handler)
      return () => { ipcRenderer.removeListener('oauth:callback', handler) }
    },
    storeToken: (provider: string, token: string) => ipcRenderer.invoke('oauth:store-token', provider, token),
    getToken: (provider: string) => ipcRenderer.invoke('oauth:get-token', provider),
  },
  notify: (title: string, body: string) => ipcRenderer.invoke('notify:show', title, body),
  openclawFetch: (url: string, init: { method?: string; headers?: Record<string, string>; body?: string }) =>
    ipcRenderer.invoke('openclaw:fetch', url, init) as Promise<{ ok: boolean; status: number; text: string }>
}

// Use `contextBridge` APIs to expose Electron APIs to
// renderer only if context isolation is enabled, otherwise
// just add to the DOM global.
if (process.contextIsolated) {
  try {
    contextBridge.exposeInMainWorld('electron', electronAPI)
    contextBridge.exposeInMainWorld('api', api)
  } catch (error) {
    console.error(error)
  }
} else {
  // @ts-ignore (define in dts)
  window.electron = electronAPI
  // @ts-ignore (define in dts)
  window.api = api
}