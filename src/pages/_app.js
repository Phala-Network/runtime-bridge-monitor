// import 'bootstrap/dist/css/bootstrap.min.css'
import '../styles/global.scss'
import 'ka-table/style.css'

import '../styles/globals.css'

import { PeerListContext } from '../utils/peer_list'
import { QueryClient, QueryClientProvider, useQuery } from 'react-query'
import SSRProvider from 'react-bootstrap/SSRProvider'

const queryClient = new QueryClient()

const PeerListWrapper = ({ children }) => {
  const query = useQuery(
    'discover',
    () => fetch('/ptp/discover', { method: 'POST' }).then((res) => res.json()),
    { refetchInterval: 1500 }
  )
  return (
    <PeerListContext.Provider value={query}>
      {children}
    </PeerListContext.Provider>
  )
}

function MyApp({ Component, pageProps }) {
  return (
    <SSRProvider>
      <QueryClientProvider client={queryClient}>
        <PeerListWrapper>
          <Component {...pageProps} />
        </PeerListWrapper>
      </QueryClientProvider>
    </SSRProvider>
  )
}

export default MyApp
