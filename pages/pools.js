import { ALIGNMENT, Grid } from 'baseui/layout-grid'
import { Button, KIND, SHAPE, SIZE } from 'baseui/button'
import { Card, StyledBody } from 'baseui/card'
import { HeadingXLarge } from 'baseui/typography'
import { Plus } from 'baseui/icon'
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
          kind={KIND.secondary}
          size={SIZE.default}
        >
          <Plus />
          Add
        </Button>
      </Grid>
      {pools.length ? (
        '1'
      ) : (
        <Grid>
          <Card overrides={{ Root: { style: { width: '100%' } } }}>
            {pools.length ? (
              'Test'
            ) : (
              <StyledBody>🈳️ Nothing found here.</StyledBody>
            )}
          </Card>
        </Grid>
      )}
    </div>
  )
}

export default PoolsPage
