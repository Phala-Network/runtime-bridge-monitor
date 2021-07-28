import { ALIGNMENT, Grid } from 'baseui/layout-grid'
import { HeadingXLarge } from 'baseui/typography'
import { Table } from 'baseui/table-semantic'
import { queryFetcher } from '../utils/query'
import { useEffect, useMemo, useRef, useState } from 'react'
import { useQuery } from 'react-query'
import { useStyletron } from 'baseui'
import Head from 'next/head'
import dayjs from 'dayjs'
import relativeTime from 'dayjs/plugin/relativeTime'

dayjs.extend(relativeTime)

const columns = ['key', 'value']

export default function Home() {
  const blockPerSecBuffer = useRef([])
  const [previousData, setPreviousData] = useState(null)
  const [blockPerSec, setBlockPerSec] = useState(0)
  const queryData = useRef([{ callOnlineFetcher: {} }]).current
  const { data: _data } = useQuery(queryData, queryFetcher, {
    refetchInterval: 1000,
    keepPreviousData: true,
  })
  const data = _data?.fetcherStateUpdate

  useEffect(() => {
    const _p = previousData

    if (previousData !== data) {
      setPreviousData(data)
      const s = data?.paraBlobHeight - _p?.paraBlobHeight || 0
      if (s <= 0) {
        return
      }
      setBlockPerSec(s)
      blockPerSecBuffer.current.push(s)
      if (blockPerSecBuffer.current.length > 5) {
        blockPerSecBuffer.current.shift()
      }
    }
  }, [data])

  const estimatedTime = useMemo(() => {
    if (blockPerSec <= 0) {
      return 'N/A'
    }
    const s =
      blockPerSecBuffer.current.reduce((sum, i) => sum + i) /
      blockPerSecBuffer.current.length
    const rest = data?.paraKnownHeight - data?.paraBlobHeight || 0
    const sec = parseInt(rest / s) || 0
    return dayjs().add(sec, 'second').fromNow(dayjs())
  }, [blockPerSec, data?.paraBlobHeight, data?.paraKnownHeight])

  const list = useMemo(() => {
    const ret = Object.keys(data || {}).map((k, i) => [
      k,
      <code key={k}>{`${data[k]}`}</code>,
    ])
    if (!data?.synched) {
      ret.push(['Speed(block/s)', <code key="blockPerSec">{blockPerSec}</code>])
      ret.push([
        'Blocks to reach target',
        <code key="delta">{data?.paraKnownHeight - data?.paraBlobHeight}</code>,
      ])
      ret.push([
        'Estimated finish time',
        <code key="estimatedTime">{estimatedTime}</code>,
      ])
    }
    return ret
  }, [
    data,
    blockPerSec,
    data?.paraKnownHeight,
    data?.paraBlobHeight,
    estimatedTime,
    data?.synched,
  ])

  const [css] = useStyletron()

  return (
    <div>
      <Head>
        <title>Fetcher Status</title>
      </Head>
      <Grid
        overrides={{ Grid: { style: { margin: '0 12px' } } }}
        align={ALIGNMENT.center}
      >
        <HeadingXLarge marginRight={'auto'}>Fetcher Status</HeadingXLarge>
      </Grid>
      <Grid
        overrides={{ Grid: { style: { margin: '0 12px 42px' } } }}
        align={ALIGNMENT.center}
      >
        <div className={css({ width: '100%' })}>
          <Table columns={columns} data={list} />
        </div>
      </Grid>
    </div>
  )
}
