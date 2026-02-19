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