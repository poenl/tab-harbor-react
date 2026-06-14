import { defineConfig } from 'wxt'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  modules: ['@wxt-dev/module-react'],
  srcDir: 'src',
  entrypointsDir: '.',
  manifest: {
    name: 'Tab Harbor',
    permissions: ['tabs', 'storage', 'tabGroups'],
    host_permissions: ['<all_urls>'],
  },
  vite: () => ({
    plugins: [tailwindcss()]
  })
})
