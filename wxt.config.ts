import { defineConfig } from 'wxt'
import path from 'path'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  modules: ['@wxt-dev/module-react'],
  srcDir: 'src',
  entrypointsDir: '.',
  vite: () => ({
    plugins: [tailwindcss()],
  }),
})
