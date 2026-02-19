import { ElectronAPI } from '@electron-toolkit/preload'

declare global {
  interface Window {
    electron: ElectronAPI
    api: {
      platform: NodeJS.Platform
      versions: {
        node: string
        chrome: string
        electron: string
      }
      oauth: {
        openUrl: (url: string) => Promise<void>
        onCallback: (callback: (url: string) => void) => void
        storeToken: (provider: string, token: string) => Promise<void>
        getToken: (provider: string) => Promise<string | null>
      }
    }
  }
}