import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Served under /admin (PLAN.md #17), so assets must resolve from that prefix — base rewrites every
// built asset URL to /admin/…. The build output (dist/) is synced to s3://…/admin/ by deploy.sh.
export default defineConfig({
  base: '/admin/',
  plugins: [react()],
  build: { outDir: 'dist', emptyOutDir: true },
});
