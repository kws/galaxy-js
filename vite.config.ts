import { defineConfig } from 'vite';
import path from 'path';
import fs from 'fs/promises';

const entries = {
  'galaxy-js': path.resolve(__dirname, 'src/main.ts'),
};

export default defineConfig({
  server: {
    allowedHosts: true,
  },
  build: {
    rollupOptions: {
      input: entries,
      output: [
        {
          format: 'es',
          entryFileNames: '[name].es.js',
          dir: 'dist',
        },
      ],
    },
    lib: false, // disables vite's single-entry lib mode
    minify: true,
  },
  plugins: [
    {
      name: 'copy-demo-html',
      writeBundle: async () => {
        const demoHtmlPath = path.resolve(__dirname, 'index.html');
        const outHtmlPath = path.resolve(__dirname, 'dist/index.html');
        let html = await fs.readFile(demoHtmlPath, 'utf8');
        html = html.replace(
          /<script type="module" src="[^"]+"><\/script>/,
          `<script type="module" src="galaxy-js.iife.js"></script>`,
        );
        await fs.writeFile(outHtmlPath, html);
      },
    },
  ],
});
