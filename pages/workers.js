import { CALL_ONLINE_LIFECYCLE_MANAGER, queryManager } from '../utils/query'
import { useQuery } from 'react-query'
import Head from 'next/head'

const WorkersPage = () => {
  const { data } = useQuery([CALL_ONLINE_LIFECYCLE_MANAGER], queryManager)
  return (
    <div>
      <Head>
        <title>Workers</title>
      </Head>
      <h1>Workers</h1>
    </div>
  )
}

export default WorkersPage
