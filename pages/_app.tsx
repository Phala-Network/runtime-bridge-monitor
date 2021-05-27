import '../styles/globals.css'
import { AppComponent, AppProps } from 'next/dist/next-server/lib/router/router'
import { BaseProvider, LightTheme } from 'baseui'
import { Provider as StyletronProvider } from 'styletron-react'
import { createStyletron } from '../styletron'
import { useMemo } from 'react'

const App: AppComponent = ({ Component, pageProps }: AppProps) => {
  const styletron = useMemo(() => createStyletron(), [])

  return (
    <StyletronProvider value={styletron}>
      <BaseProvider theme={LightTheme}>
        <Component {...pageProps} />
      </BaseProvider>
    </StyletronProvider>
  )
}

export default App
