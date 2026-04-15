import type { Route } from '@middy/http-router';

export function withPrefix<E, R>(prefix: `/${string}`, routes: Array<Route<E, R>>): Array<Route<E, R>> {
  return routes.map((r) => ({
    ...r,
    path: `${prefix}${r.path === '/' ? '' : r.path}`.replace(/\/+/g, '/'),
  }));
}
