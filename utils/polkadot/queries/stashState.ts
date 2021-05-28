import { ApiPromise } from '@polkadot/api'
import { AccountId } from '@polkadot/types/interfaces'
import { useQuery, UseQueryResult } from 'react-query'
import { v4 as uuidv4 } from 'uuid'
import { StashInfo } from '../../../vendor/interfaces'

const useStashStateQueryId = uuidv4()

export const useStashStateQuery = (account?: AccountId | string, api?: ApiPromise): UseQueryResult<StashInfo> => {
  return useQuery(
    [useStashStateQueryId, account, api],
    async () => account === undefined ? undefined : await api?.query.phala.stashState(account)
  )
}
