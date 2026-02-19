/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_APP_TITLE: string;
  readonly VITE_OPENCLAW_URL: string;
  readonly VITE_OPENCLAW_TOKEN: string;
  readonly VITE_BADGE_SERVICE_URL: string;
  readonly VITE_AUTH_URL: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

interface Window {
  api: {
    platform: string;
    versions: { node: string; chrome: string; electron: string };
    oauth: {
      openUrl: (url: string) => Promise<boolean>;
      onCallback: (callback: (url: string) => void) => () => void;
      storeToken: (provider: string, token: string) => Promise<boolean>;
      getToken: (provider: string) => Promise<string | null>;
    };
    notify: (title: string, body: string) => Promise<boolean>;
    openclawFetch: (url: string, init: { method?: string; headers?: Record<string, string>; body?: string }) =>
      Promise<{ ok: boolean; status: number; text: string }>;
  };
}