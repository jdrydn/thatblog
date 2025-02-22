import fs from 'fs';
import path from 'path';
import yaml from 'yaml';

const data = yaml.parse(fs.readFileSync(path.join(__dirname, '../data.yml'), 'utf8'));

export interface Site {
  id: string;
  config?: {
    origin?: string;
    basePath?: string;
  };
  title?: string;
  meta?: Record<string, string | undefined>;
}

export const site = data.site as Site;

export interface Page {
  id: string;
  title?: string;
  contents?: Array<Content>;
}

export const pages = data.pages as Array<Page>;

export interface Post {
  id: string;
  title?: string;
  contents?: Array<Content>;
  contentExcerptTo?: Content['id'] | undefined;
  readMore?: boolean;
  publishedAt: Date;
}

export type Content =
  | { id: string; type: 'PLAIN_TEXT'; value: string }
  | { id: string; type: 'MARKDOWN'; value: string }
  | { id: string; type: 'RICH_TEXT'; value: string };

export const posts = data.posts as Array<Post>;
