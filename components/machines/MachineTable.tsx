import { TableBuilder, TableBuilderColumn } from 'baseui/table-semantic'
import React, { ReactElement, ReactNode, useMemo } from 'react'
import { StyledSpinnerNext } from 'baseui/spinner'
import { useApiPromise } from '../../utils/polkadot/hooks/useApiPromise'
import { useWorkerStateQuery } from '../../utils/polkadot/queries/workerState'
import { WorkerInfo } from '../../vendor/interfaces'
import { useAddressNormalizer } from '../../utils/polkadot/helpers/normalizeAddress'

interface MachineTableProps {
  addresses?: string[]
}

const LoadingSpinner = (): ReactElement => <StyledSpinnerNext $as="span" />

const WorkerStateColumn = ({ address, children }: {
  address: string
  children: (worker?: WorkerInfo) => ReactNode
}): ReactElement => {
  const { api } = useApiPromise()
  const { data: worker, isFetching } = useWorkerStateQuery(address, api)
  const node = useMemo<ReactNode>(() => children(worker), [children, worker])
  return node === undefined || isFetching ? <LoadingSpinner /> : <>{node}</>
}

// on chain: machine id, pubkey, state, overall score, confidence level, runtime version, payout target, miner stash balance

export const MachineTable = ({ addresses }: MachineTableProps): ReactElement => {
  const { api } = useApiPromise()
  const normalizeAddress = useAddressNormalizer(api)

  return (
    <TableBuilder data={addresses ?? []} isLoading={addresses === undefined}>
      <TableBuilderColumn header="Stash">
        {(address: string) => normalizeAddress(address)}
      </TableBuilderColumn>

      <TableBuilderColumn header="Machine Id">
        {(address: string) => (
          <WorkerStateColumn address={address}>
            {(worker) => worker?.machineId.toHex()}
          </WorkerStateColumn>
        )}
      </TableBuilderColumn>
    </TableBuilder>
  )
}
