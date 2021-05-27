import { Client, Server } from 'styletron-engine-atomic'
import { StandardEngine } from 'styletron-standard'

const getHydrateClass = (): HTMLStyleElement[] => {
  const elements = [...document.getElementsByClassName('_styletron_hydrate_')]
  return elements.filter(
    (element) => element instanceof HTMLStyleElement
  ) as HTMLStyleElement[]
}

export const createStyletron = (): StandardEngine =>
  typeof window === 'undefined'
    ? new Server()
    : new Client({ hydrate: getHydrateClass() })
