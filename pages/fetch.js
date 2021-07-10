import { ListItem, ListItemLabel } from 'baseui/list'
import { useEffect, useMemo, useRef, useState } from 'react'
import { useQuery } from 'react-query'
import Head from 'next/head'
import dayjs from 'dayjs'
import relativeTime from 'dayjs/plugin/relativeTime'

dayjs.extend(relativeTime)

const fetcher = ({ queryKey: [url] }) => fetch(url).then((r) => r.json())

export default function Home() {
  const blockPerSecBuffer = useRef([])
  const [previousData, setPreviousData] = useState(null)
  const [blockPerSec, setBlockPerSec] = useState(0)
  const { data } = useQuery('/api/fetch_status', fetcher, {
    refetchInterval: 1000,
    keepPreviousData: true,
  })

  useEffect(() => {
    const _p = previousData

    if (previousData !== data) {
      setPreviousData(data)
      const s = data?.blobHeight - _p?.blobHeight || 0
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

  const list = useMemo(
    () => Object.keys(data || {}).map((k) => [k, data[k]]),
    [data]
  )

  const estimatedTime = useMemo(() => {
    if (blockPerSec <= 0) {
      return 'N/A'
    }
    const s =
      blockPerSecBuffer.current.reduce((sum, i) => sum + i) /
      blockPerSecBuffer.current.length
    const rest = data?.knownHeight - data?.blobHeight || 0
    const sec = parseInt(rest / s) || 0
    return dayjs().add(sec, 'second').fromNow(dayjs())
  }, [blockPerSec, data?.blobHeight, data?.knownHeight])

  return (
    <div>
      <Head>
        <title>Fetcher Status</title>
      </Head>
      <h1>Fetcher Status</h1>
      {list.map((i) => (
        <ListItem key={i[0]}>
          <ListItemLabel description={<code>{`${i[1]}`}</code>}>
            {i[0]}
          </ListItemLabel>
        </ListItem>
      ))}
      {!data?.hasReachedInitTarget ? (
        <>
          <ListItem>
            <ListItemLabel description={<code>{blockPerSec}</code>}>
              Speed(block/s)
            </ListItemLabel>
          </ListItem>
          <ListItem>
            <ListItemLabel
              description={<code>{data?.knownHeight - data?.blobHeight}</code>}
            >
              Blocks to reach target
            </ListItemLabel>
          </ListItem>
          <ListItem>
            <ListItemLabel description={<code>{estimatedTime}</code>}>
              Estimated finish time
            </ListItemLabel>
          </ListItem>
        </>
      ) : null}
    </div>
  )
}
