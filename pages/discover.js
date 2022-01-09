import { Button } from 'baseui/button'
import { Card, StyledBody } from 'baseui/card'
import { HeaderWrapper } from '../components/PageWrapper'
import { HeadingSmall, HeadingXLarge } from 'baseui/typography'
import { ListItem, ListItemLabel } from 'baseui/list'
import { SIZE, StyledSpinnerNext } from 'baseui/spinner'
import { useQuery } from 'react-query'
import { useRouter } from 'next/router'
import { useStyletron, withStyle } from 'baseui'
import Head from 'next/head'

const LoadingIcon = withStyle(StyledSpinnerNext, {
  display: 'inline-block',
  verticalAlign: '-4px',
  marginRight: '8px',
})

const PeerItem = ({ peer, children, ...rest }) => (
  <ListItem {...rest}>
    <ListItemLabel description={children}>
      <pre>{JSON.stringify(peer, null, 2)}</pre>
    </ListItemLabel>
  </ListItem>
)

export default function DiscoverPage() {
  const { isLoading, error, data } = useQuery('discover', () =>
    fetch('/ptp/discover').then((res) => res.json())
  )

  const [css] = useStyletron()
  const router = useRouter()

  return (
    <div>
      <Head>
        <title>Peer Discovery</title>
      </Head>
      <HeaderWrapper>
        <HeadingXLarge marginRight={'auto'}>Peer Discovery</HeadingXLarge>
      </HeaderWrapper>
      <div style={{ margin: '0 64px' }}>
        {isLoading ? (
          <Card overrides={{ Root: { style: { width: '100%' } } }}>
            {isLoading ? (
              <StyledBody>
                <p>
                  <LoadingIcon $size={SIZE.small} />
                  Waiting for data...
                </p>
              </StyledBody>
            ) : (
              <div className={css({ width: '100%' })}>
                {error ? (
                  error.toString()
                ) : (
                  <>
                    {data?.dataProviders?.length ? (
                      <>
                        <HeadingSmall>Data Providers</HeadingSmall>
                      </>
                    ) : null}
                  </>
                )}
              </div>
            )}
          </Card>
        ) : (
          <>
            <>{error ? <p>{error.toString()}</p> : null}</>
            <>
              {data?.dataProviders?.length ? (
                <>
                  <HeadingSmall margin="0 auto 21px">
                    Data Providers
                  </HeadingSmall>
                  <Card overrides={{ Root: { style: { width: '100%' } } }}>
                    <ul
                      className={css({
                        width: '100%',
                        paddingLeft: 0,
                        paddingRight: 0,
                      })}
                    >
                      {data.dataProviders.map((i, idx) => (
                        <PeerItem peer={i} key={`dp-${idx}`}>
                          <Button
                            onClick={() =>
                              router.push(`/data_provider/${i.peerId}`)
                            }
                          >
                            Status
                          </Button>
                        </PeerItem>
                      ))}
                    </ul>
                  </Card>
                </>
              ) : null}
            </>
            <>
              {data?.lifecycleManagers?.length ? (
                <>
                  <HeadingSmall margin="36px auto 21px">
                    Lifecycle Managers
                  </HeadingSmall>
                  <Card overrides={{ Root: { style: { width: '100%' } } }}>
                    <ul
                      className={css({
                        width: '100%',
                        paddingLeft: 0,
                        paddingRight: 0,
                      })}
                    >
                      {data.lifecycleManagers.map((i, idx) => (
                        <PeerItem peer={i} key={`lm-${idx}`}>
                          <Button
                            onClick={() => router.push(`/worker/${i.peerId}`)}
                          >
                            Workers
                          </Button>
                          <div
                            className={css({
                              width: '12px',
                              display: 'inline-block',
                            })}
                          />
                          <Button
                            onClick={() => router.push(`/pool/${i.peerId}`)}
                          >
                            Pools
                          </Button>
                        </PeerItem>
                      ))}
                    </ul>
                  </Card>
                </>
              ) : null}
            </>
          </>
        )}
      </div>
    </div>
  )
}
