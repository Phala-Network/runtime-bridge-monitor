import { MessageTarget } from '../message/proto'
import Head from 'next/head'
import getServer from '../server'
import logger from '../utils/logger'

export default function Home({ fetcherStateUpdate }) {
  return (
    <div>
      <Head>
        <title>Monitor</title>
      </Head>
      <pre>{JSON.stringify(fetcherStateUpdate, null, 2)}</pre>
    </div>
  )
}

const queryFetcherState = async () => {
  const { query } = await getServer()
  const { content: fetcherStateUpdate } = await query({
    to: MessageTarget.values.MTG_FETCHER,
    callOnlineFetcher: {},
  })
  logger.debug(fetcherStateUpdate, 'fetcher state updated.')
  return fetcherStateUpdate
}

export async function getServerSideProps(context) {
  const { fetcherStateUpdate } = await queryFetcherState()
  return {
    props: {
      fetcherStateUpdate,
    },
  }
}
