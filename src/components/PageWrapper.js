import { Alert, Container, Spinner, Stack } from 'react-bootstrap'
import Head from 'next/head'
import Topbar from './Topbar'
import styled from 'styled-components'

const PageWrapper = ({
  children,
  title,
  hideLinks = false,
  showLifecycleLinks = false,
}) => {
  return (
    <>
      <Head>
        <title>{title}</title>
      </Head>
      <Stack gap={4}>
        <Topbar
          name={title}
          hideLinks={hideLinks}
          showLifecycleLinks={showLifecycleLinks}
        />
        {children}
      </Stack>
    </>
  )
}

export default PageWrapper

const OverlayWrapper = styled.div`
  width: 100%;
  height: 100%;
  display: flex;
  left: 0;
  top: 0;
  position: fixed;
  align-items: center;
  place-content: center;
  background: rgba(255, 255, 255, 0.35);
  backdrop-filter: blur(3px);
`

export const PageStatusOverlay = ({ isLoading = true, error }) => {
  return isLoading || error ? (
    <OverlayWrapper>
      {isLoading && !error ? (
        <Spinner animation="grow" role="status" variant="secondary">
          <span className="visually-hidden">Loading...</span>
        </Spinner>
      ) : null}
      {error && (
        <Container>
          <Alert variant="danger" dismissible={false}>
            <Alert.Heading>Oh snap! You got an error!</Alert.Heading>
            <pre>
              {error instanceof Error
                ? error.toString()
                : JSON.stringify(error, null, 2)}
            </pre>
          </Alert>
        </Container>
      )}
    </OverlayWrapper>
  ) : null
}
