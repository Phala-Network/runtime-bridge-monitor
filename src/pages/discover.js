import {
  Col,
  Container,
  Dropdown,
  DropdownButton,
  ListGroup,
  Stack,
} from 'react-bootstrap'
import { useQuery } from 'react-query'
import { useRouter } from 'next/router'
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
                        href={`/lifecycle/pool/${i.peerId}`}
                        target="_blank"
                      >
                        Manage Pools
                      </Dropdown.Item>
                      <Dropdown.Item
                        href={`/lifecycle/worker/${i.peerId}`}
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
  const { isLoading, error, data } = useQuery(
    'discover',
    () => fetch('/ptp/discover', { method: 'POST' }).then((res) => res.json()),
    { refetchInterval: 1500 }
  )

  return (
    <DiscoverPageWrapper>
      {data && <DiscoverPageData data={data} />}
      <PageStatusOverlay error={error} isLoading={isLoading} />
    </DiscoverPageWrapper>
  )
}
