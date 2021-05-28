import '../styles/globals.css'
import { AppComponent, AppProps } from 'next/dist/next-server/lib/router/router'
import { BaseProvider, LightTheme } from 'baseui'
import { Poc4 } from '@phala/typedefs'
import { QueryClient, QueryClientProvider } from 'react-query'
import { Provider as StyletronProvider } from 'styletron-react'
import React, { useMemo } from 'react'
import { createStyletron } from '../styletron'
import { PHALA_NODE_ENDPOINT } from '../utils/config'
import { ApiPromiseProvider } from '../utils/polkadot/hooks/useApiPromise'

const App: AppComponent = ({ Component, pageProps }: AppProps) => {
  const client = useMemo(() => new QueryClient(), [])
  const styletron = useMemo(() => createStyletron(), [])

  return (
    <ApiPromiseProvider endpoint={PHALA_NODE_ENDPOINT} registryTypes={Poc4}>
      <QueryClientProvider client={client}>
        <StyletronProvider value={styletron}>
          <BaseProvider theme={LightTheme}>
            <Component {...pageProps} />
          </BaseProvider>
        </StyletronProvider>
      </QueryClientProvider>
    </ApiPromiseProvider>
  )
}

export default App
