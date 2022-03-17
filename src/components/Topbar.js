import { Container, Nav, Navbar } from 'react-bootstrap'
import { useRouter } from 'next/router'

export default function Topbar({
  name,
  hideLinks = false,
  showLifecycleLinks = false,
}) {
  const router = useRouter()
  const { id } = router.query

  return (
    <Navbar bg="light" className="overflow-auto w-100">
      <Container>
        <Navbar.Brand>{name || 'Runtime Bridge'}</Navbar.Brand>
        {!hideLinks && (
          <Navbar.Collapse id="navbarScroll">
            <Nav className="me-auto">
              {showLifecycleLinks && id && (
                <>
                  <Nav.Link target="_blank" href={`/lifecycle/status/${id}`}>
                    Status
                  </Nav.Link>
                  <Nav.Link target="_blank" href={`/lifecycle/pools/${id}`}>
                    Pools
                  </Nav.Link>
                  <Nav.Link target="_blank" href={`/lifecycle/workers/${id}`}>
                    Workers
                  </Nav.Link>
                </>
              )}
            </Nav>
            <Nav>
              <Nav.Link href="/discover">Peer Discovery</Nav.Link>
            </Nav>
          </Navbar.Collapse>
        )}
      </Container>
    </Navbar>
  )
}
