import { BaseProvider, LightTheme } from 'baseui'
import { Provider as JotaiProvider } from 'jotai'
import { Provider as StyletronProvider } from 'styletron-react'
import { _styletron as styletron } from '../styletron'

import '../styles/globals.css'
import { QueryClient, QueryClientProvider } from 'react-query'
import PageWrapper from '../components/PageWrapper'

const queryClient = new QueryClient()

function MyApp({ Component, pageProps }) {
  return (
    <JotaiProvider>
      <StyletronProvider value={styletron}>
        <BaseProvider theme={LightTheme}>
          <QueryClientProvider client={queryClient}>
            <PageWrapper>
              <Component {...pageProps} />
            </PageWrapper>
          </QueryClientProvider>
        </BaseProvider>
      </StyletronProvider>
    </JotaiProvider>
  )
}

export default MyApp
