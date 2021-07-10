import { BaseProvider, LightTheme, styled } from 'baseui'
import { Provider as StyletronProvider } from 'styletron-react'
import { styletron } from '../styletron'

import '../styles/globals.css'
import { QueryClient, QueryClientProvider } from 'react-query'
import PageWrapper from '../components/PageWrapper'

const queryClient = new QueryClient()

function MyApp({ Component, pageProps }) {
  return (
    <StyletronProvider value={styletron}>
      <BaseProvider theme={LightTheme}>
        <QueryClientProvider client={queryClient}>
          <PageWrapper>
            <Component {...pageProps} />
          </PageWrapper>
        </QueryClientProvider>
      </BaseProvider>
    </StyletronProvider>
  )
}

export default MyApp
