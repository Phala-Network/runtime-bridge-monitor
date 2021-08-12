import { CALL_ONLINE_LIFECYCLE_MANAGER, queryManager } from '../utils/query'
import { atom, useAtom } from 'jotai'
import { useEffect } from 'react'
import { useQuery } from 'react-query'
import { useUpdateAtom } from 'jotai/utils'
import produce from 'immer'

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
const workerStatesAtom = atom({})
const workerListWithState = atom((get) => {
  const states = get(workerStatesAtom)
  return get(workersArr).map((w) => ({
    id: w.uuid,
    data: {
      ...w,
      ...(states[w.uuid] || {}),
    },
  }))
}, null)

const updateWorkerState = atom(null, async (get, set, worker) => {
  const {
    workerStateUpdate: {
      workerStates: [workerState],
    },
  } = await queryManager({
    queryKey: [
      {
        queryWorkerState: {
          ids: [{ uuid: worker.uuid }],
        },
      },
    ],
  })

  const states = get(workerStatesAtom)
  set(
    workerStatesAtom,
    produce(states, (draft) => {
      draft[workerState.worker.uuid] = workerState
    })
  )
})

export const useWorkerListWithStates = (workers) => {
  const [workerState] = useAtom(workerListWithState)
  const setWorkerState = useUpdateAtom(updateWorkerState)
  useEffect(() => {
    const unsub = []
    for (const w of workers) {
      setWorkerState(w)
      unsub.push(setInterval(() => setWorkerState(w), 3000))
    }
    return () => unsub.map((i) => clearInterval(i))
  }, [workers])
  return workerState
}

export { workersArr as workers, poolsArr as pools }
