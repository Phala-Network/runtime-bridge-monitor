import { CALL_ONLINE_LIFECYCLE_MANAGER, queryManager } from '../utils/query'
import { atom } from 'jotai'
import { useEffect } from 'react'
import { useQuery } from 'react-query'
import { useUpdateAtom } from 'jotai/utils'

const workersArr = atom([])
const poolsArr = atom([])

export const updateAllLists = atom(null, (get, set, { workers, pools }) => {
  set(workersArr, workers)
  set(poolsArr, pools)
})

export const useUpdatedLists = () => {
  const updateLists = useUpdateAtom(updateAllLists)
  const { data } = useQuery([CALL_ONLINE_LIFECYCLE_MANAGER], queryManager)

  useEffect(() => {
    const res = data?.lifecycleManagerStateUpdate
    if (res) {
      updateLists({ workers: res.workers || [], pools: res.pools || [] })
    }
  }, [data])
}

export { workersArr as workers, poolsArr as pools }
