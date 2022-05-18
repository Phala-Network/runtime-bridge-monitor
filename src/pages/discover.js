import { Col, Container, Dropdown, ListGroup, Stack } from 'react-bootstrap'
import { usePeerList } from '../utils/peer_list'
import PageWrapper, { PageStatusOverlay } from '../components/PageWrapper'

const DiscoverPageWrapper = ({ children }) => {
  return (
    <PageWrapper title="Peer Discovery" hideLinks>
      <Container fluid="xxl">
        <Col>{children}</Col>
      </Container>
    </PageWrapper>
  )
}

const DiscoverPageData = ({ data }) => {
  return (
    <Container>
      <Stack gap={2}>
        {!!data.dataProviders.length && (
          <>
            <h4>Data Providers({data.dataProviders.length})</h4>
            <ListGroup as="ol">
              {data.dataProviders.map((i) => (
                <ListGroup.Item
                  as="li"
                  key={i.peerId}
                  className="d-flex justify-content-end align-items-start "
                >
                  <div className="ms-2 me-2 overflow-auto w-100">
                    <p> </p>
                    <pre>{JSON.stringify(i, null, 2)}</pre>
                  </div>
                  <Dropdown className="position-absolute mt-2">
                    <Dropdown.Toggle
                      variant="secondary"
                      id={`dropdown-${i.peerId}`}
                      className="opacity-50"
                    >
                      Actions
                    </Dropdown.Toggle>
                    <Dropdown.Menu>
                      <Dropdown.Item
                        href={`/dp/status/${i.peerId}`}
                        target="_blank"
                      >
                        Status
                      </Dropdown.Item>
                    </Dropdown.Menu>
                  </Dropdown>
                </ListGroup.Item>
              ))}
            </ListGroup>
          </>
        )}
        {!!data.lifecycleManagers.length && (
          <>
            <p> </p>
            <h4>Lifecycle Managers({data.lifecycleManagers.length})</h4>
            <ListGroup as="ol">
              {data.lifecycleManagers.map((i) => (
                <ListGroup.Item
                  as="li"
                  key={i.peerId}
                  className="d-flex justify-content-end align-items-start "
                >
                  <div className="ms-2 me-2 overflow-auto w-100">
                    <p> </p>
                    <pre>{JSON.stringify(i, null, 2)}</pre>
                  </div>
                  <Dropdown className="position-absolute mt-2">
                    <Dropdown.Toggle
                      variant="secondary"
                      id={`dropdown-${i.peerId}`}
                      className="opacity-50"
                    >
                      Actions
                    </Dropdown.Toggle>
                    <Dropdown.Menu>
                      <Dropdown.Item
                        href={`/lifecycle/status/${i.peerId}`}
                        target="_blank"
                      >
                        Status
                      </Dropdown.Item>
                      <Dropdown.Item
                        href={`/lifecycle/pools/${i.peerId}`}
                        target="_blank"
                      >
                        Manage Pools
                      </Dropdown.Item>
                      <Dropdown.Item
                        href={`/lifecycle/workers/${i.peerId}`}
                        target="_blank"
                      >
                        Manage Workers
                      </Dropdown.Item>
                    </Dropdown.Menu>
                  </Dropdown>
                </ListGroup.Item>
              ))}
            </ListGroup>
          </>
        )}
      </Stack>
    </Container>
  )
}

export default function DiscoverPage() {
  const { isLoading, data, error } = usePeerList()
  return (
    <DiscoverPageWrapper>
      {data && !data?.hasError && <DiscoverPageData data={data} />}
      <PageStatusOverlay
        error={data?.hasError ? data : error}
        isLoading={isLoading}
      />
    </DiscoverPageWrapper>
  )
}
