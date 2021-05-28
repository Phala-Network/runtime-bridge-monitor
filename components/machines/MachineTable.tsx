import { TableBuilder, TableBuilderColumn } from 'baseui/table-semantic'
import React, { ReactElement, ReactNode, useMemo } from 'react'
import { StyledSpinnerNext } from 'baseui/spinner'
import { useApiPromise } from '../../utils/polkadot/hooks/useApiPromise'
import { useWorkerStateQuery } from '../../utils/polkadot/queries/workerState'
import { StashInfo, WorkerInfo } from '../../vendor/interfaces'
import { useAddressNormalizer } from '../../utils/polkadot/helpers/normalizeAddress'
import { withApiPromise } from '../../utils/polkadot/withApiPromise'
import { useStashStateQuery } from '../../utils/polkadot/queries/stashState'

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

const WorkerCurrentStateColumn = ({ address }: { address: string }): ReactElement => {
  return (
    <WorkerStateColumn address={address}>
      {worker => {
        if (worker !== undefined) {
          const { type, value } = worker.state
          return (
            value.isEmpty
              ? <>{type.toString()}</>
              : <>{type.toString()} in {value.toString()}</>
          )
        } else {
          return undefined
        }
      }}
    </WorkerStateColumn>
  )
}

const StashStateColumn = ({ address, children }: {
  address: string
  children: (worker?: StashInfo) => ReactNode
}): ReactElement => {
  const { api } = useApiPromise()
  const { data: worker, isFetching } = useStashStateQuery(address, api)
  const node = useMemo<ReactNode>(() => children(worker), [children, worker])
  return node === undefined || isFetching ? <LoadingSpinner /> : <>{node}</>
}

export const MachineTable = ({ addresses }: MachineTableProps): ReactElement => {
  const normalizeAddress = withApiPromise(useAddressNormalizer)()

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

      <TableBuilderColumn header="Public Key">
        {(address: string) => (
          <WorkerStateColumn address={address}>
            {worker => worker?.pubkey.toHex()}
          </WorkerStateColumn>
        )}
      </TableBuilderColumn>

      <TableBuilderColumn header="State">
        {(address: string) => (
          <WorkerCurrentStateColumn address={address} />
        )}
      </TableBuilderColumn>

      <TableBuilderColumn header="Overall Score">
        {(address: string) => (
          <WorkerStateColumn address={address}>
            {worker => worker?.score.unwrapOr(undefined)?.overallScore.toString()}
          </WorkerStateColumn>
        )}
      </TableBuilderColumn>

      <TableBuilderColumn header="Conf. Level">
        {(address: string) => (
          <WorkerStateColumn address={address}>
            {worker => worker?.confidenceLevel.toString()}
          </WorkerStateColumn>
        )}
      </TableBuilderColumn>

      <TableBuilderColumn header="Rt. Ver">
        {(address: string) => (
          <WorkerStateColumn address={address}>
            {worker => worker?.runtimeVersion.toString()}
          </WorkerStateColumn>
        )}
      </TableBuilderColumn>

      <TableBuilderColumn header="Payout Addr.">
        {(address: string) => (
          <StashStateColumn address={address}>
            {worker => worker !== undefined && normalizeAddress(worker.payoutPrefs.target)}
          </StashStateColumn>
        )}
      </TableBuilderColumn>
    </TableBuilder>
  )
}
