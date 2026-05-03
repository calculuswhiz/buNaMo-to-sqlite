// My own implementation of a Result type implementing the more useful functions from neverthrow from NPM.

type _Ok<T> = { readonly isOk: true, readonly value: T };
type _Err<T> = { readonly isOk: false, readonly error: T };
type _Result<T, E> = _Ok<T> | _Err<E>;

export interface IResult<T, E> {
  unwrapOr<U>(defaultValue: U): T | U;
  mapIfOk<U>(fn: (arg: T) => U): Result<U, E>;
};
export type Result<T, E> = IResult<T, E> & _Result<T, E>;
export type Ok<T> = Result<T, never>;
export type Err<E> = Result<never, E>;

/** Create a result type */
function result<T = never, E = never>(init: _Result<T, E>): Result<T, E> {
  return {
    ...init,
    unwrapOr: d => init.isOk ? init.value : d,
    mapIfOk: fn => init.isOk ? ok(fn(init.value)) : err(init.error)
  };
}

/** Create an Ok result */
export function ok<T>(value: T): Ok<T> {
  return result({ isOk: true, value });
}

/** Create an Err result */
export function err<E>(error: E): Err<E> {
  return result({ isOk: false, error });
}