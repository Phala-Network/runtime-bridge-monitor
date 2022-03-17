import { Container, Nav, Navbar } from 'react-bootstrap'

export default function Topbar({ name, hideLinks = false }) {
  return (
    <Navbar bg="light">
      <Container>
        <Navbar.Brand>{name || 'Runtime Bridge'}</Navbar.Brand>
        {!hideLinks && (
          <Navbar.Collapse id="navbarScroll">
            <Nav className="me-auto" />
            <Nav>
              <Nav.Link href="/discover">Peer Discovery</Nav.Link>
            </Nav>
          </Navbar.Collapse>
        )}
      </Container>
    </Navbar>
  )
}
