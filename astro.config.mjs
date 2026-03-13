// @ts-check
import { defineConfig } from 'astro/config'
import glsl from 'vite-plugin-glsl'

// https://astro.build/config
export default defineConfig({
  scopedStyleStrategy: 'where',
  devToolbar: { enabled: false },
  server: {
    host: true,
  },
  base: '/webgl-scroll-sync/',
  vite: {
    plugins: [glsl()],
    build: {
      assetsInlineLimit: 0,
      cssCodeSplit: false,
      rollupOptions: {
        output: {
          entryFileNames: 'assets/scripts/entry.js',
          chunkFileNames: 'assets/scripts/chunk_[hash].js',
          assetFileNames: 'assets/style/main[extname]',
        },
      },
    },
    css: {
      preprocessorOptions: {
        scss: {
          api: 'modern-compiler',
        },
      },
    },
  },
})
