import { defineConfig } from 'vite';
import path from 'path';
import fs from 'fs/promises';

export default defineConfig({
  build: {
    lib: {
      entry: path.resolve(__dirname, 'src/main.ts'),
      name: 'GalaxyJS',
      fileName: () => 'galaxy-js.iife.js',
      formats: ['iife'],
    },
    minify: true,
    outDir: 'dist',
    emptyOutDir: false, // Don't wipe the dist directory
    rollupOptions: {
      output: {
        // Ensures the output file is named correctly
        entryFileNames: 'galaxy-js.iife.js',
      },
    },
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