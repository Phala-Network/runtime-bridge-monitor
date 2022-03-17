import { Badge, Col, Container, Row, Stack } from 'react-bootstrap'
import { FilteringMode, PagingPosition, SortingMode } from 'ka-table/enums'
import { Table, kaReducer } from 'ka-table'
import dynamic from 'next/dynamic'

import { queryProxy } from '../../../utils/query'
import { useMemo, useState } from 'react'
import { useQuery } from 'react-query'
import { useRouter } from 'next/router'
import PageWrapper, { PageStatusOverlay } from '../../../components/PageWrapper'

const LifecycleManagerStatusPageWrapper = ({ children }) => {
  return (
    <PageWrapper title={`Lifecycle Manager Status`} showLifecycleLinks>
      <Container fluid={true}>{children}</Container>
    </PageWrapper>
  )
}

const LifecycleManagerStatusData = ({ workers }) => {
  return (
    <>
      <Row>
        <Container fluid={true}>
          <WorkerTable workers={workers} />
        </Container>
      </Row>
    </>
  )
}
const tablePropsInit = {
  columns: [
    {
      key: 'name',
      title: 'Name',
      width: 150,
    },
    {
      key: 'pid',
      title: 'PID',
      width: 80,
    },
    {
      key: 'status',
      title: 'Status',
      width: 150,
    },
    {
      key: 'lastMessage',
      title: 'Last Message',
      width: 'auto',
    },
    {
      key: 'paraBlockDispatchedTo',
      title: 'Blk Height',
      width: 150,
    },
    {
      key: 'publicKey',
      title: 'Public Key',
      width: 600,
    },
    { key: 'uuid', title: 'ID', width: 360 },
  ],
  rowKeyField: 'id',
  sortingMode: SortingMode.Single,
  filteringMode: FilteringMode.FilterRow,
  table: {
    elementAttributes: () => ({
      className: 'table table-striped table-hover table-bordered',
    }),
  },
  tableHead: {
    elementAttributes: () => ({
      className: 'thead-dark',
    }),
  },
  paging: {
    enabled: true,
    pageIndex: 0,
    pageSize: 20,
    pageSizes: [10, 20, 50, 100],
    position: PagingPosition.TopAndBottom,
  },
}

const _WorkerTable = ({ workers }) => {
  const [tableProps, changeTableProps] = useState(tablePropsInit)
  const dispatch = (action) => {
    changeTableProps((prevState) => kaReducer(prevState, action))
  }

  return <Table data={workers} {...tableProps} dispatch={dispatch} />
}

const WorkerTable = dynamic(() => Promise.resolve(_WorkerTable), { ssr: false })

const LifecycleManagerStatusPage = () => {
  const router = useRouter()
  const { id } = router.query

  const { isLoading, error, data } = useQuery(
    id,
    () => queryProxy(id, 'GetWorkerStatus', {}),
    { refetchInterval: 3000 }
  )

  const _workers = data?.data?.workerStates || []
  const workers = useMemo(() => {
    _workers.forEach((r) => {
      Object.assign(r, r.worker)
      r.id = r.uuid
    })
    return _workers
  }, [_workers])

  return (
    <LifecycleManagerStatusPageWrapper>
      <Stack gap={2}>
        <Container>
          <Row>
            <Col md="auto">
              <h4>Status</h4>
            </Col>
            <Col>
              <Stack
                gap={2}
                direction="horizontal"
                className="mt-1 overflow-auto"
              >
                <Badge bg="secondary">
                  <small>{id}</small>
                </Badge>
                <Badge bg="secondary">
                  <small>Total count: {workers.length}</small>
                </Badge>
              </Stack>
            </Col>
          </Row>
        </Container>
        <LifecycleManagerStatusData workers={workers} />
      </Stack>
      <PageStatusOverlay
        error={data?.hasError ? data : error}
        isLoading={isLoading}
      />
    </LifecycleManagerStatusPageWrapper>
  )
}

export default LifecycleManagerStatusPage
