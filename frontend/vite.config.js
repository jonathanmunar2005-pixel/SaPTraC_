import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { fileURLToPath, URL } from 'node:url'

const compatBridge = (name) =>
  fileURLToPath(new URL(`./src/vendor/es-toolkit-compat/${name}.js`, import.meta.url))

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      'es-toolkit/compat/get': compatBridge('get'),
      'es-toolkit/compat/range': compatBridge('range'),
      'es-toolkit/compat/omit': compatBridge('omit'),
      'es-toolkit/compat/maxBy': compatBridge('maxBy'),
      'es-toolkit/compat/sumBy': compatBridge('sumBy'),
      'es-toolkit/compat/sortBy': compatBridge('sortBy'),
      'es-toolkit/compat/throttle': compatBridge('throttle'),
      'es-toolkit/compat/minBy': compatBridge('minBy'),
      'es-toolkit/compat/last': compatBridge('last'),
      'es-toolkit/compat/uniqBy': compatBridge('uniqBy'),
      'es-toolkit/compat/isPlainObject': compatBridge('isPlainObject'),
    },
  },
})
