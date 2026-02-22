import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// GitHub Pagesへのデプロイ用設定（リポジトリ名に合わせて変更可能）
export default defineConfig({
  plugins: [react()],
  base: './',
})
