import { Card, StyledBody } from 'baseui/card'
import { HeaderWrapper } from '../../components/PageWrapper'
import { HeadingXLarge } from 'baseui/typography'
import { SIZE, StyledSpinnerNext } from 'baseui/spinner'
import { Table } from 'baseui/table-semantic'
import { useMemo } from 'react'
import { useQuery } from 'react-query'
import { useRouter } from 'next/router'
import { useStyletron, withStyle } from 'baseui'
import Head from 'next/head'

const columns = ['key', 'value']

const LoadingIcon = withStyle(StyledSpinnerNext, {
  display: 'inline-block',
  verticalAlign: '-4px',
  marginRight: '8px',
})

const DataProviderStatus = () => {
  const router = useRouter()
  const { id } = router.query

  const { data } = useQuery(
    id,
    () =>
      fetch(`/ptp/proxy/${id}/GetDataProviderInfo`).then((res) => res.json()),
    { refetchInterval: 1500 }
  )

  const [css] = useStyletron()

  const list = useMemo(() => {
    return Object.keys(data?.data || {}).map((k) => [
      k,
      <code key={k}>{`${data.data[k]}`}</code>,
    ])
  }, [data])

  return (
    <div>
      <Head>
        <title>Data Provider Status</title>
      </Head>
      <HeaderWrapper>
        <HeadingXLarge marginRight={'auto'}>Data Provider Status</HeadingXLarge>
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

export default DataProviderStatus
