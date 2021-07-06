import { Card, StyledBody } from 'baseui/card'
import { ListItem, ListItemLabel } from 'baseui/list'
import { useMemo } from 'react'
import { useQuery } from 'react-query'
import Head from 'next/head'

const fetcher = ({ queryKey: [url] }) => fetch(url).then((r) => r.json())

export default function Home() {
  const { data } = useQuery('/api/fetch_status', fetcher, {
    refetchInterval: 2000,
  })

  const list = useMemo(
    () => Object.keys(data || {}).map((k) => [k, data[k]]),
    [data]
  )

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
        </StyledBody>
      </Card>
    </div>
  )
}
