export const pick = <T extends Record<PropertyKey, any>, K extends (keyof T)[]>(
  obj: T,
  keys: K
): Pick<T, K[number]> => {
  const keySet = new Set(keys)

  return Object.fromEntries(
    Object.entries(obj).filter(([k]) => keySet.has(k))
  ) as any
}
