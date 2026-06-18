/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_LIFF_ID: string;
  readonly VITE_THOR_PROMO_ENABLED: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
