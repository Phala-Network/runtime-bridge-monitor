import '../styles/globals.css'
import 'bootstrap/dist/css/bootstrap.min.css'
import { QueryClient, QueryClientProvider } from 'react-query'
import SSRProvider from 'react-bootstrap/SSRProvider'

const queryClient = new QueryClient()

function MyApp({ Component, pageProps }) {
  return (
    <SSRProvider>
      <QueryClientProvider client={queryClient}>
        <Component {...pageProps} />
      </QueryClientProvider>
    </SSRProvider>
  )
}

export default MyApp
