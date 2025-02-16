import { formatDate } from 'date-fns';
import { marked } from 'marked';
import sanitise from 'sanitize-html';

import type { Site } from '@/backend/src/data';

import type { FilterThis } from './types';

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

export function date_to_string(date: string, format: string = 'dd MMM yyyy'): string {
  const parsed = new Date(date);
  return isNaN(parsed.getTime()) ? '' : formatDate(new Date(date), format);
}

export function uri_escape(input: string): string {
  return encodeURIComponent(input);
}

export function array_to_sentence_string<T>(input: T, sep: string = ','): string | T {
  return Array.isArray(input) ? input.join(sep) : input;
}

export function markdownify(input: string): string {
  return sanitise(marked.parse(input, { async: false }), {
    allowedTags: [
      'a',
      'abbr',
      'b',
      'blockquote',
      'br',
      'code',
      'dd',
      'dl',
      'dt',
      'em',
      'h1',
      'h2',
      'h3',
      'h4',
      'h5',
      'h6',
      'hr',
      'i',
      'img',
      'li',
      'ol',
      'p',
      'pre',
      's',
      'strong',
      'sub',
      'sup',
      'u',
      'ul',
    ],
    allowedAttributes: {
      a: ['href', 'title'],
      img: ['src', 'alt'],
    },
    allowedSchemes: ['http', 'https', 'mailto', 'tel'],
    allowedSchemesAppliedToAttributes: ['href', 'src'],
  });
}
