export const isString = (value: unknown): value is string => typeof value === 'string';
export const isPlainObject = (value: unknown): value is object =>
  typeof value === 'object' && value !== null && !Array.isArray(value);

export function flattenTree<T>(
  root: T,
  children: (node: T) => Iterable<T>,
  predicate: (node: T) => boolean = (): boolean => true
): Set<T> {
  const results = new Set<T>();
  const visited = new Set<T>();
  const toProcess = [root];
  while (toProcess.length) {
    const node = toProcess.shift()!;
    if (visited.has(node)) {
      continue;
    }
    visited.add(node);
    if (predicate(node)) {
      results.add(node);
    }
    toProcess.push(...children(node));
  }
  return results;
}

export function* concatIterables<T>(...iterables: Iterable<T>[]): Iterable<T> {
  for (const iterable of iterables) {
    for (const item of iterable) {
      yield item;
    }
  }
}
