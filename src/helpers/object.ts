function isObject(object: unknown): boolean {
  const type = typeof object;
  return type === "function" || (type === "object" && !!object);
}

export function deepEqual<T extends Record<string, any>>(a: T | null, b: T | null): boolean {
  if (!a || !b) return false;
  if (!Object.keys(a).length || !Object.keys(b).length) return false;
  const keysA = Object.keys(a);
  const keysB = Object.keys(b);
  if (keysA.length !== keysB.length) return false;

  for (const key of keysA) {
    const valA = a[key];
    const valB = b[key];
    if (valA !== valB && (!isObject(valA) || !deepEqual(valA, valB))) return false;
  }
  return true;
}

export function deepCopy<T>(object: T): T {
  return JSON.parse(JSON.stringify(object));
}
