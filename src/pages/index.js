import { useEffect } from 'react'
import Head from 'next/head'
import router from 'next/router'

const IndexPage = () => {
  useEffect(() => {
    router.push('/discover')
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
