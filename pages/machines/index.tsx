import { Pagination } from 'baseui/pagination'
import { NextPage } from 'next'
import React, { useEffect, useMemo, useState } from 'react'
import { MachineTable } from '../../components/machines/MachineTable'
import { useApiPromise } from '../../utils/polkadot/hooks/useApiPromise'
import { useAddressNormalizer } from '../../utils/polkadot/helpers/normalizeAddress'
import { useWorkersPagedQuery } from '../../utils/polkadot/queries/workerState'

const defaultPageSize = 10

const MachineTablePage: NextPage = () => {
  const { api } = useApiPromise()
  const normalizeAddress = useAddressNormalizer(api)

  const [page, setPage] = useState<number>(1)
  const data = useWorkersPagedQuery(page, defaultPageSize, api)

  const { addresses, pages } = useMemo(() => {
    if (data === undefined) {
      return { addresses: [], pages: 1 }
    } else {
      return { addresses: data.accounts.map(account => normalizeAddress(account)), pages: Math.floor(data.count / defaultPageSize) + 1 }
    }
  }, [data, normalizeAddress])

  useEffect(() => { page > pages && setPage(1) }, [page, pages])

  return (
    <>
      <MachineTable addresses={addresses} />
      <Pagination
        numPages={pages}
        currentPage={page}
        onPageChange={({ nextPage }) => { setPage(Math.min(Math.max(nextPage, 1), pages)) }}
      />
    </>
  )
}

export default MachineTablePage
