import { ALIGNMENT, Grid } from 'baseui/layout-grid'
import { Button, KIND, SHAPE, SIZE } from 'baseui/button'
import { Card, StyledBody } from 'baseui/card'
import { HeadingXLarge } from 'baseui/typography'
import { pools as poolsAtom, useUpdatedLists } from '../atoms/mgmt'
import { useAtom } from 'jotai'
import Head from 'next/head'

const PoolsPage = () => {
  const [pools] = useAtom(poolsAtom)
  useUpdatedLists()

  return (
    <div>
      <Head>
        <title>Pools</title>
      </Head>
      <Grid
        overrides={{ Grid: { style: { margin: '0 12px' } } }}
        align={ALIGNMENT.center}
      >
        <HeadingXLarge marginRight={'auto'}>Pools</HeadingXLarge>
        <Button
          onClick={() => alert('click')}
          shape={SHAPE.pill}
          kind={KIND.secondary}
        >
          Add
        </Button>
      </Grid>
      {pools.length ? (
        '1'
      ) : (
        <Grid>
          {!pools.length && (
            <Card overrides={{ Root: { style: { width: '100%' } } }}>
              <StyledBody>Nothing here.</StyledBody>
            </Card>
          )}
        </Grid>
      )}
    </div>
  )
}

export default PoolsPage
