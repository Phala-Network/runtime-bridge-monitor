import { Badge, Col, Container, Row, Stack, Table } from 'react-bootstrap'
import { useMemo } from 'react'
import { useQuery } from 'react-query'
import { useRouter } from 'next/router'
import PageWrapper, { PageStatusOverlay } from '../../../components/PageWrapper'

const DataProviderStatusPageWrapper = ({ children }) => {
  return (
    <PageWrapper title={`Data Provider`}>
      <Container fluid="xxl">
        <Container>{children}</Container>
      </Container>
    </PageWrapper>
  )
}

const DataProviderStatusData = ({ data }) => {
  const router = useRouter()
  const { id } = router.query

  const list = useMemo(() => {
    return Object.keys(data?.data || {}).map((k) => [
      k,
      <span key={k}>
        <code>{`${data.data[k]}`}</code>
      </span>,
    ])
  }, [data])

  return (
    <Stack gap={2}>
      <Row>
        <Col md="auto">
          <h4>Status</h4>
        </Col>
        <Col>
          <Badge bg="secondary">
            <small>{id}</small>
          </Badge>
        </Col>
      </Row>
      <Row>
        <Container>
          <Table hover>
            <thead>
              <tr>
                <th>Key</th>
                <th>Value</th>
              </tr>
            </thead>
            <tbody>
              {list.map((i) => (
                <tr key={`status-${id}-${i[0]}`}>
                  <td>{i[0]}</td>
                  <td>{i[1]}</td>
                </tr>
              ))}
            </tbody>
          </Table>
        </Container>
      </Row>
    </Stack>
  )
}

const DataProviderStatusPage = () => {
  const router = useRouter()
  const { id } = router.query

  const { isLoading, error, data } = useQuery(
    id,
    () =>
      fetch(`/ptp/proxy/${id}/GetDataProviderInfo`).then((res) => res.json()),
    { refetchInterval: 1500 }
  )

  return (
    <DataProviderStatusPageWrapper>
      {data && !data?.hasError && <DataProviderStatusData data={data} />}
      <PageStatusOverlay
        error={data?.hasError ? data : error}
        isLoading={isLoading}
      />
    </DataProviderStatusPageWrapper>
  )
}

export default DataProviderStatusPage
