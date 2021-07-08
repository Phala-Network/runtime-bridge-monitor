import { Card, StyledBody } from 'baseui/card'
import { ListItem, ListItemLabel } from 'baseui/list'
import { useEffect, useMemo, useState } from 'react'
import { useQuery } from 'react-query'
import Head from 'next/head'
import dayjs from 'dayjs'
import relativeTime from 'dayjs/plugin/relativeTime'

dayjs.extend(relativeTime)

const fetcher = ({ queryKey: [url] }) => fetch(url).then((r) => r.json())

export default function Home() {
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
      setBlockPerSec(data?.blobHeight - _p?.blobHeight || 0)
    }
  }, [data])

  const list = useMemo(
    () => Object.keys(data || {}).map((k) => [k, data[k]]),
    [data]
  )

  const estimatedTime = useMemo(() => {
    const rest = data?.knownHeight - data?.blobHeight || 0
    const sec = parseInt(rest / blockPerSec) || 0
    return dayjs().add(sec, 'second').fromNow(dayjs())
  }, [blockPerSec, data?.blobHeight, data?.knownHeight])

  return (
    <div>
      <Head>
        <title>Monitor</title>
      </Head>
      <Card
        overrides={{ Root: { style: { width: '640px' } } }}
        title="Fetcher Status"
      >
        <StyledBody>
          {list.map((i) => (
            <ListItem key={i[0]}>
              <ListItemLabel description={<code>{`${i[1]}`}</code>}>
                {i[0]}
              </ListItemLabel>
            </ListItem>
          ))}
          {!data?.hasReachedInitTarget ? (
            <ListItem>
              <ListItemLabel description={<code>{blockPerSec}</code>}>
                blockPerSec
              </ListItemLabel>
              <ListItemLabel description={<code>{estimatedTime}</code>}>
                estimatedTime
              </ListItemLabel>
            </ListItem>
          ) : null}
        </StyledBody>
      </Card>
    </div>
  )
}
