import { Client, Server } from 'styletron-engine-atomic'

const getHydrateClass = () =>
  document.getElementsByClassName('_styletron_hydrate_')

export const _styletron =
  typeof window === 'undefined'
    ? new Server()
    : new Client({
        hydrate: getHydrateClass(),
      })

export const styletron = _styletron
