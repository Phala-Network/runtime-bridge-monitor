import { BaseProvider, LightTheme, styled } from 'baseui'
import { Provider as StyletronProvider } from 'styletron-react'
import { styletron } from '../styletron'

import '../styles/globals.css'

function MyApp({ Component, pageProps }) {
  return (
    <StyletronProvider value={styletron}>
      <BaseProvider theme={LightTheme}>
        <Component {...pageProps} />
      </BaseProvider>
    </StyletronProvider>
  )
}

export default MyApp
