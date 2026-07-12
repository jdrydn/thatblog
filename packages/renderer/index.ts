import { Liquid } from 'liquidjs';
import { toLiquidFS } from './liquid-fs';

// @thatblog/renderer wraps LiquidJS behind a tiny, source-agnostic loader so the exact same render
// path runs in prod (templates from S3) and in the theme-kit / tests (templates from local disk) —
// "works in theme-kit" therefore implies "works in prod" (PLAN.md section 9). This package is the one
// piece meant to be genuinely standalone (PLAN.md #6): its only dependency is LiquidJS. The S3 loader
// lives in frontend-site, which already carries the AWS SDK — here we ship just the node-fs loader.

// A template source, reduced to the two operations LiquidJS actually needs. `path` is always a
// template-relative posix path the renderer composed (e.g. `timeline.liquid`, `partials/post-card.liquid`);
// a loader maps it onto its backing store (a directory, an S3 prefix, …).
export interface TemplateLoader {
  readFile(path: string): Promise<string>;
  exists(path: string): Promise<boolean>;
}

export interface Renderer {
  // Render a theme template by name (no extension) with a view model, returning the HTML string.
  render(template: string, data: Record<string, unknown>): Promise<string>;
}

// Build a renderer over a loader. LiquidJS owns template parsing + its own warm-container template
// cache; we only hand it a virtual filesystem (toLiquidFS) pointed at the loader. `.liquid` extension
// and a single virtual root ('.') keep template names clean (`timeline`, `partials/post-card`).
export function createRenderer(loader: TemplateLoader): Renderer {
  const engine = new Liquid({
    fs: toLiquidFS(loader),
    root: ['.'],
    extname: '.liquid',
  });

  return {
    render: (template, data) => engine.renderFile(template, data),
  };
}

export { fsLoader } from './loaders/fs';
