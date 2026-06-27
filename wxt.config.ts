import { defineConfig } from 'wxt'
import tailwindcss from '@tailwindcss/vite'
import babel from '@rolldown/plugin-babel'

export default defineConfig({
  modules: ['@wxt-dev/module-react'],
  srcDir: 'src',
  entrypointsDir: '.',
  webExt: {
    disabled: true
  },
  manifest: ({ mode }) => ({
    name: mode === 'development' ? 'Tab Harbor Dev' : 'Tab Harbor',
    permissions: ['tabs', 'storage', 'tabGroups', 'bookmarks', 'favicon'],
    host_permissions: ['<all_urls>']
  }),
  vite: () => ({
    plugins: [
      tailwindcss(),
      babel({
        presets: [() => ({ plugins: [['babel-plugin-react-compiler', { target: '19' }]] })]
      })
    ]
  })
})
