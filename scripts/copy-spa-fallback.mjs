import { copyFileSync } from 'node:fs'
import { join } from 'node:path'

const indexPath = join('dist', 'index.html')
copyFileSync(indexPath, join('dist', '404.html'))
console.log('Copied dist/index.html -> dist/404.html for SPA routing')
