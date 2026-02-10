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
    }
  }
}