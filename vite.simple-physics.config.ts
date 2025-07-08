import { defineConfig } from 'vite';
import path from 'path';

export default defineConfig({
  build: {
    lib: {
      entry: path.resolve(__dirname, 'src/physics/simple.ts'),
      name: 'SimplePhysics',
      fileName: 'simple-physics.es',
      formats: ['es']
    },
    outDir: 'dist',
    minify: true,
    emptyOutDir: false, // Don't wipe out main build
  },
}); 