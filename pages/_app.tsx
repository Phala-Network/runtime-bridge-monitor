import { Poc4 } from '@phala/typedefs'
import { BaseProvider, LightTheme } from 'baseui'
import { AppNavBar, NavItemT, setItemActive } from 'baseui/app-nav-bar'
import { StyledSpinnerNext } from 'baseui/spinner'
import { PLACEMENT as ToastPlacement, toaster, ToasterContainer } from 'baseui/toast'
import { AppComponent, AppProps } from 'next/dist/next-server/lib/router/router'
import { useRouter } from 'next/router'
import React, { Key, PropsWithChildren, ReactElement, useEffect, useMemo, useRef, useState } from 'react'
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

interface NavItemWithTarget extends NavItemT {
  info: {
    target: string
  }
}

const App: AppComponent = ({ Component, pageProps }: AppProps) => {
  const client = useMemo(() => new QueryClient(), [])
  const styletron = useMemo(() => createStyletron(), [])

  const { pathname, push } = useRouter()

  const [mainItems, setMainItems] = useState<NavItemWithTarget[]>([
    {
      active: pathname === '/',
      label: 'Overview',
      info: { target: '/' }
    }, {
      active: pathname === '/machines',
      label: 'Machines',
      info: { target: '/machines' }
    }
  ])

  const handleMainItemSelect = (item: NavItemWithTarget): void => {
    push(item.info.target).catch(error => {
      console.error(`[_app] Failed navigating to ${item.info.target}: ${(error as Error)?.message ?? error}`)
    })
    setMainItems(prev => setItemActive(prev, item) as NavItemWithTarget[])
  }

  return (
    <ApiPromiseProvider endpoint={PHALA_NODE_ENDPOINT} registryTypes={Poc4}>
      <QueryClientProvider client={client}>
        <StyletronProvider value={styletron}>
          <BaseProvider theme={LightTheme}>
            <GlobalFetchingToasterContainer>
              <AppNavBar
                mainItems={mainItems}
                onMainItemSelect={item => handleMainItemSelect(item as NavItemWithTarget)}
              />
              <Component {...pageProps} />
            </GlobalFetchingToasterContainer>
          </BaseProvider>
        </StyletronProvider>
      </QueryClientProvider>
    </ApiPromiseProvider>
  )
}

export default App
