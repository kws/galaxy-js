import { defineConfig } from 'vite';
import path from 'path';

export default defineConfig({
  build: {
    lib: {
      entry: path.resolve(__dirname, 'src/physics/index.ts'),
      name: 'SimplePhysics',
      fileName: 'simple-physics',
      formats: ['es'],
    },
    outDir: 'dist',
    rollupOptions: {
      // No externalization for a single file bundle
    },
    minify: false,
    emptyOutDir: false, // Don't wipe out main build
  },
}); 