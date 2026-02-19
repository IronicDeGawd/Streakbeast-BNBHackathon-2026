/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_APP_TITLE: string;
  readonly VITE_OPENCLAW_URL: string;
  readonly VITE_OPENCLAW_TOKEN: string;
  readonly VITE_BADGE_SERVICE_URL: string;
  readonly VITE_GITHUB_CLIENT_ID: string;
  readonly VITE_STRAVA_CLIENT_ID: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}