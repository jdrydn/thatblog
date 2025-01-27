import type { FilterThis } from './types';

import type { Site } from '@/backend/src/data';

export function relative_url(this: FilterThis, suffix: string): string {
  const { site } = this.context.globals;
  const { basePath } = (site as Site).config ?? {};
  return (basePath ?? '') + suffix;
}

export function absolute_url(this: FilterThis, suffix: string): string {
  const { site } = this.context.globals;
  const { origin, basePath } = (site as Site).config ?? {};
  return (origin ?? '') + (basePath ?? '') + suffix;
}

export function theme_url(this: FilterThis, suffix: string): string {
  const { theme_prefix } = this.context.globals;
  return theme_prefix + suffix;
}
