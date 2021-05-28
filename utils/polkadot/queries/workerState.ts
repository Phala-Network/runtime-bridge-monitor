import { ApiPromise } from '@polkadot/api'
import { AccountId } from '@polkadot/types/interfaces'
import { useQuery, UseQueryResult } from 'react-query'
import { v4 as uuidv4 } from 'uuid'
import { WorkerInfo } from '../../../vendor/interfaces'

const getWorkerState = async (
  address: AccountId | string,
  api: ApiPromise
): Promise<WorkerInfo | null | undefined> => {
  const result = await api.query.phala.workerState(address)
  return result.isEmpty ? undefined : result
}

const WorkerStateQueryKey = uuidv4()

export const useWorkerStateQuery = (
  address: AccountId | string,
  api?: ApiPromise
): UseQueryResult<WorkerInfo> => {
  return useQuery([WorkerStateQueryKey, address, api], async () => {
    return api !== undefined ? await getWorkerState(address, api) : undefined
  })
}

const WorkersQueryKey = uuidv4()

export const useWorkersQuery = (api?: ApiPromise): UseQueryResult<AccountId[]> => {
  return useQuery([WorkersQueryKey, api], async () => {
    return api !== undefined
      ? (await api.query.phala.workerState.keys()).map(({ args: [accountId] }) => accountId)
      : undefined
  })
}

type UseWorkersPagedQueryResult = { accounts: AccountId[], count: number } | undefined

export const useWorkersPagedQuery = (number: number, size: number, api?: ApiPromise): UseWorkersPagedQueryResult => {
  const { data } = useWorkersQuery(api)
  if (data === undefined) { return undefined }
  return {
    accounts: data.slice((number - 1) * size, number * size),
    count: data.length
  }
}
