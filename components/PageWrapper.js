import { Cell, Grid } from 'baseui/layout-grid'
import { StyledTabList, Tab, Tabs } from 'baseui/tabs-motion'
import { useRouter } from 'next/router'

const ROUTES = [
  { route: '/fetch', name: 'Fetcher' },
  { route: '/workers', name: 'Workers' },
]

const TabsOverrides = {
  TabList: {
    component: function TabsListOverride(props) {
      return (
        <Grid>
          <Cell span={12}>
            <StyledTabList {...props} />
          </Cell>
        </Grid>
      )
    },
  },
}

const AppNavbar = () => {
  const { route, push } = useRouter()
  return (
    <Tabs
      activeKey={route}
      onChange={({ activeKey }) => {
        push(activeKey)
      }}
      overrides={TabsOverrides}
    >
      {ROUTES.map(({ route, name }) => (
        <Tab key={route} route={route} title={name} />
      ))}
    </Tabs>
  )
}

const PageWrapper = ({ children }) => {
  return (
    <>
      <AppNavbar />
      <Grid>
        <Cell span={12}>{children}</Cell>
      </Grid>
    </>
  )
}
export default PageWrapper
