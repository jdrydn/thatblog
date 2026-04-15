/**
 * Isomorphic functions, that can be run in both the client & server
 */

/**
 * Return the size of a JSON item **in bytes**
 */
export function calculateJsonSize(data: unknown): number {
  return new TextEncoder().encode(JSON.stringify(data)).length;
}
