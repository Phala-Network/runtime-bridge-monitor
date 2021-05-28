import { Poc4 } from '@phala/typedefs'
import { BaseProvider, LightTheme } from 'baseui'
import { StyledSpinnerNext } from 'baseui/spinner'
import { PLACEMENT as ToastPlacement, toaster, ToasterContainer } from 'baseui/toast'
import { AppComponent, AppProps } from 'next/dist/next-server/lib/router/router'
import React, { Key, PropsWithChildren, ReactElement, useEffect, useMemo, useRef } from 'react'
import { QueryClient, QueryClientProvider, useIsFetching } from 'react-query'
import { Provider as StyletronProvider } from 'styletron-react'
import { v4 as uuidv4 } from 'uuid'
import '../styles/globals.css'
import { createStyletron } from '../styletron'
import { PHALA_NODE_ENDPOINT } from '../utils/config'
import { ApiPromiseProvider } from '../utils/polkadot/hooks/useApiPromise'

const GlobalFetchingToasterContainerKey = uuidv4()

const GlobalFetchingToasterContainer = ({ children }: PropsWithChildren<{}>): ReactElement => {
  const isFetching = useIsFetching()

  const loadingToaster = useRef<Key>()

  useEffect(() => {
    if (isFetching > 0 && loadingToaster.current === undefined) {
      loadingToaster.current = toaster.info(
        <StyledSpinnerNext $as="span" />,
        {
          closeable: false,
          key: GlobalFetchingToasterContainerKey,
          overrides: {
            Body: {
              style: { backgroundColor: 'black', width: 'auto' }
            }
          }
        }
      )
    }

    if (isFetching === 0 && loadingToaster.current !== undefined) {
      toaster.clear(loadingToaster.current)
      loadingToaster.current = undefined
    }
  }, [isFetching])

  return (<ToasterContainer placement={ToastPlacement.bottomLeft}>{children}</ToasterContainer>)
}

const App: AppComponent = ({ Component, pageProps }: AppProps) => {
  const client = useMemo(() => new QueryClient(), [])
  const styletron = useMemo(() => createStyletron(), [])

  return (
    <ApiPromiseProvider endpoint={PHALA_NODE_ENDPOINT} registryTypes={Poc4}>
      <QueryClientProvider client={client}>
        <StyletronProvider value={styletron}>
          <BaseProvider theme={LightTheme}>
            <GlobalFetchingToasterContainer>
              <Component {...pageProps} />
            </GlobalFetchingToasterContainer>
          </BaseProvider>
        </StyletronProvider>
      </QueryClientProvider>
    </ApiPromiseProvider>
  )
}

export default App
