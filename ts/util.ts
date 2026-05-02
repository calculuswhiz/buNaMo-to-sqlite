/** Runtime non-null assertion */
export function _nn<T>(value: T | null | undefined, message?: string): NonNullable<T> {
  if (value === null || value === undefined)
    throw new Error(message ?? "Unexpected null or undefined value");

  return value as NonNullable<T>;
}

export function lowerFirstLetter(str: string): string {
  if (str.length === 0)
    return str;
  else
    return str[0].toLowerCase() + str.slice(1);
}

/** Plays nicer with ESLint */
export type MultiRecord<
  T extends PropertyKey[], V
> = T extends [infer U extends PropertyKey, ...infer Rest extends PropertyKey[]]
  ? Record<U, MultiRecord<Rest, V>>
  : V;
