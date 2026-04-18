/** Runtime non-null assertion */
export function _nn<T>(value: T | null | undefined, message?: string): NonNullable<T> {
  if (value === null || value === undefined)
    throw new Error(message ?? "Unexpected null or undefined value");

  return value as NonNullable<T>;
}