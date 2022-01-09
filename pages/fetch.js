import { ALIGNMENT, Grid } from 'baseui/layout-grid'
import { Card, StyledBody } from 'baseui/card'
import { HeaderWrapper } from '../components/PageWrapper'
import { HeadingXLarge } from 'baseui/typography'
import { SIZE, StyledSpinnerNext } from 'baseui/spinner'
import { Table } from 'baseui/table-semantic'
import { queryFetcher } from '../utils/query'
import { useEffect, useMemo, useRef, useState } from 'react'
import { useQuery } from 'react-query'
import { useStyletron, withStyle } from 'baseui'
import Head from 'next/head'
import dayjs from 'dayjs'
import relativeTime from 'dayjs/plugin/relativeTime'

dayjs.extend(relativeTime)

const columns = ['key', 'value']

const LoadingIcon = withStyle(StyledSpinnerNext, {
  display: 'inline-block',
  verticalAlign: '-4px',
  marginRight: '8px',
})

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
      <HeaderWrapper>
        <HeadingXLarge marginRight={'auto'}>Fetcher Status</HeadingXLarge>
      </HeaderWrapper>
      <div style={{ margin: '0 42px' }}>
        <Card overrides={{ Root: { style: { width: '100%' } } }}>
          {list.length ? (
            <div className={css({ width: '100%' })}>
              <Table columns={columns} data={list} />
            </div>
          ) : (
            <StyledBody>
              <p>
                <LoadingIcon $size={SIZE.small} />
                Waiting for data...
              </p>
            </StyledBody>
          )}
        </Card>
      </div>
    </div>
  )
}
