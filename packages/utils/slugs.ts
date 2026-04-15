import _kebabCase from 'lodash/kebabCase';

export function createSlug(id: string, title: string | undefined): string {
  if (title) {
    return _kebabCase(`${title}`) + '-' + id.replace(/-/g, '');
  } else {
    return id.replace(/-/g, '');
  }
}

export function parseSlug(slug: string): string | undefined {
  let id: string | undefined = undefined;

  if (slug.length === 32) {
    id = slug;
  } else if (slug.length > 32) {
    if (!slug.includes('-')) {
      return undefined;
    }

    id = slug.split('-').pop();
    if (id === undefined || id.length !== 32) {
      return undefined;
    }
  } else {
    return undefined;
  }

  return id.replace(/^(.{8})(.{4})(.{4})(.{4})(.{12})$/, '$1-$2-$3-$4-$5');
}
