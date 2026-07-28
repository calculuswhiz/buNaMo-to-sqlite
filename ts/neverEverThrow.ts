type ResultCommon<TOk extends boolean, T, E> = {
  /** Result is OK. Usually easier to check isErr instead */
  readonly isOk: TOk;
  /** Defined for convenience. Opposite of isOk. */
  readonly isErr: TOk extends true ? false : true;

  /** Unwrap if Ok, otherwise give supplied value */
  unwrapOr<U>(defaultValue: U): TOk extends true ? T : U;
  /** If the result is Ok, map to another value */
  mapOk<U>(fn: (arg: T) => U): TOk extends true ? Ok<U> : Err<E>;
  /** If the result is Err, map to another value */
  mapErr<U>(fn: (arg: E) => U): TOk extends true ? Ok<T> : Err<U>;
  /** Log the value */
  logErr(): TOk extends true ? Ok<T> : Err<E>;
}

export type Ok<T> = ResultCommon<true, T, never> & { readonly value: T }
export type Err<E> = ResultCommon<false, never, E> & { readonly error: E }
/** Combined result type */
export type Result<T, E> = Ok<T> | Err<E>;

export function ok<T>(value: T): Ok<T> {
  const result = {
    isOk: true, isErr: false, value,
    unwrapOr: () => value,
    mapOk: fn => ok(fn(value)),
    mapErr: () => result,
    logErr: () => result
  } as Ok<T>;

  return result;
}

export function err<E>(error: E): Err<E> {
  const result = {
    isOk: false, isErr: true, error,
    unwrapOr: defaultVal => defaultVal,
    mapOk: () => result,
    mapErr: fn => err(fn(error)),
    logErr: () => {
      console.error(error);
      return result;
    }
  } as Err<E>;

  return result;
}