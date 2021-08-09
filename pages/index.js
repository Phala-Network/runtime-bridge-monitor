import { useEffect } from 'react'
import Head from 'next/head'
import router from 'next/router'

const IndexPage = () => {
  useEffect(() => {
    router.push('/fetch')
  }, [])
  return (
    <div>
      <Head>
        <title>Loading...</title>
      </Head>
    </div>
  )
}
export default IndexPage
