import { defineConfig } from "vitest/dist/config";
import { resolve } from "path";

export default defineConfig({
    resolve: {
      alias: {
        // Aliasuje ścieżki, jeśli jest to konieczne, na przykład:
        '@': resolve(__dirname, 'src'),
      },
    },
    test: {
      // Opcje konfiguracyjne dla Vitest
      globals: true,
      environment: 'jsdom',
    },
  });