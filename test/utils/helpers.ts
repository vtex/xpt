import { nth } from 'ramda'

export function notNull<T> (v: T | null | undefined): T {
  if (v == null) { throw new Error('Null assertion failed') }
  return v
}

export function invertedNth<T> (u: ReadonlyArray<T>) {
  return (v: number): T | undefined => nth(v,u)
}
