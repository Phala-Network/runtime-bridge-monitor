import { CALL_ONLINE_LIFECYCLE_MANAGER, queryManager } from '../utils/query'
import { atom, useAtom } from 'jotai'
import { useAtomValue, useUpdateAtom } from 'jotai/utils'
import { useEffect } from 'react'
import { useQuery } from 'react-query'
import produce from 'immer'

const workersArr = atom([])
const poolsArr = atom([])

export const nsList = process.env.NEXT_PUBLIC_NS_LIST.split(',').map((i) =>
  i.trim()
)

export const currentNs = atom(nsList[0])

export const setNs = atom(null, (get, set, ns) => {
  if (get(currentNs) !== ns) {
    set(workersArr, [])
    set(poolsArr, [])
  }
  set(currentNs, ns)
})

export const updateAllLists = atom(null, (get, set, { workers, pools }) => {
  set(workersArr, workers)
  set(poolsArr, pools)
})

export const useUpdatedLists = () => {
  const updateLists = useUpdateAtom(updateAllLists)
  const ns = useAtomValue(currentNs)
  const { data } = useQuery([ns, CALL_ONLINE_LIFECYCLE_MANAGER], queryManager)

  useEffect(() => {
    const res = data?.lifecycleManagerStateUpdate
    if (res) {
      updateLists({ workers: res.workers || [], pools: res.pools || [] })
    }
  }, [ns, data])
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

const updateWorkerState = atom(null, async (get, set, workers) => {
  const {
    workerStateUpdate: { workerStates },
  } = await queryManager({
    queryKey: [
      get(currentNs),
      {
        queryWorkerState: {
          ids: workers.map((i) => ({ uuid: i.uuid })),
        },
      },
    ],
  })

  const states = get(workerStatesAtom)

  set(
    workerStatesAtom,
    produce(states, (draft) => {
      for (const workerState of workerStates) {
        if (workerState?.worker?.uuid) {
          draft[workerState.worker.uuid] = workerState
          draft[workerState.worker.uuid].minerInfo = JSON.parse(
            workerState?.minerInfoJson || '{}'
          )
        }
      }
    })
  )
})

export const useWorkerListWithStates = (workers) => {
  const [workerState] = useAtom(workerListWithState)
  const setWorkerState = useUpdateAtom(updateWorkerState)
  useEffect(() => {
    const unsub = []
    const _workers = workers.filter((w) => w.enabled && !w.deleted)
    setWorkerState(_workers)
    unsub.push(setInterval(() => setWorkerState(_workers), 3000))
    return () => unsub.map((i) => clearInterval(i))
  }, [workers])
  return workerState
}

export { workersArr as workers, poolsArr as pools }
