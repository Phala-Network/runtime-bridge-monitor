import { Badge, Col, Container, Row, Stack } from 'react-bootstrap'
import {
  DataType,
  EditingMode,
  FilteringMode,
  PagingPosition,
  SortingMode,
} from 'ka-table/enums'
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
      dataType: DataType.String,
      inlineCode: true,
    },
    {
      key: 'pid',
      title: 'PID',
      width: 120,
      dataType: DataType.Number,
      inlineCode: true,
    },
    {
      key: 'status',
      title: 'Status',
      width: 150,
      dataType: DataType.String,
      inlineCode: true,
    },
    {
      key: 'lastMessage',
      title: 'Last Message',
      isResizable: true,
      width: 600,
      dataType: DataType.String,
      inlineCode: true,
    },
    {
      key: 'paraBlockDispatchedTo',
      title: 'Block Height',
      width: 150,
      dataType: DataType.Number,
      inlineCode: true,
    },
    {
      key: 'paraHeaderSynchedTo',
      title: 'Header Height',
      width: 150,
      dataType: DataType.Number,
      inlineCode: true,
    },
    {
      key: 'parentHeaderSynchedTo',
      title: 'Parent Header Height',
      width: 150,
      dataType: DataType.Number,
      inlineCode: true,
    },
    {
      key: 'publicKey',
      title: 'Public Key',
      width: 600,
      dataType: DataType.String,
      inlineCode: true,
    },
    {
      key: 'minerInfo.state',
      title: 'On-chain State',
      width: 180,
      dataType: DataType.String,
      inlineCode: true,
    },
    {
      key: 'minerInfo.v',
      title: 'V',
      width: 180,
      dataType: DataType.Number,
      inlineCode: true,
    },
    {
      key: 'minerInfo.ve',
      title: 'Ve',
      width: 180,
      dataType: DataType.Number,
      inlineCode: true,
    },
    {
      key: 'minerInfo.raw.benchmark.pInstant',
      title: 'pInstant',
      width: 120,
      dataType: DataType.Number,
      inlineCode: true,
    },
    {
      key: 'minerInfo.raw.benchmark.pInit',
      title: 'pInit',
      width: 120,
      dataType: DataType.Number,
      inlineCode: true,
    },
    {
      key: 'minerInfo.raw.stats.totalReward',
      title: 'Minted(BN)',
      width: 220,
      dataType: DataType.Number,
      inlineCode: true,
    },
    {
      key: 'minerAccountId',
      title: 'Miner Account',
      width: 420,
      dataType: DataType.String,
      inlineCode: true,
    },
    {
      key: 'uuid',
      title: 'ID',
      width: 360,
      dataType: DataType.String,
      inlineCode: true,
    },
  ],
  rowKeyField: 'id',
  sortingMode: SortingMode.Single,
  editingMode: EditingMode.None,
  filteringMode: FilteringMode.FilterRow,
  columnResizing: true,
  childComponents: {
    noDataRow: {
      content: () => 'No Data Found',
    },
  },
  paging: {
    enabled: true,
    pageIndex: 0,
    pageSize: 100,
    pageSizes: [50, 100, 300, 500],
    position: PagingPosition.TopAndBottom,
  },
  format: ({ column, value }) => {
    if (column.inlineCode === true) {
      return <code>{value}</code>
    }
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
      r.minerInfo = JSON.parse(r.minerInfoJson || '{}')
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
