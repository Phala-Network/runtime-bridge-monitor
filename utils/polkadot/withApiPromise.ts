import { ApiPromise } from '@polkadot/api'
import { useApiPromise } from './hooks/useApiPromise'

type CurriedRightFn<Ret, RestArgs extends [...any[]]> = (...args: RestArgs) => Ret

type CurryRightFn<A, Ret = any, RestArgs extends [...any[]] = [...any[]], FnArgs extends [...RestArgs, A] = [...RestArgs, A]> = FnArgs extends any[] ? (...args: FnArgs) => Ret : never

const curryRight = <A, Ret, RestArgs extends [...any[]], FnArgs extends [...RestArgs, A]>(a: A, fn: CurryRightFn<A, Ret, RestArgs, FnArgs>): CurriedRightFn<Ret, RestArgs> => {
  return (...args: RestArgs) => fn(...args, a)
}

export const withApiPromise = <Ret, RA extends [...any[]]>(fn: CurryRightFn<ApiPromise, Ret, RA>): CurriedRightFn<Ret, RA> => {
  // eslint-disable-next-line react-hooks/rules-of-hooks
  const { api } = useApiPromise()
  return curryRight(api, fn)
}
