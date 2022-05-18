import { createContext, useContext, useState } from 'react'

export const PeerListContext = createContext({ isLoading: true })

export const usePeerList = () => useContext(PeerListContext)

export const usePeer = (peerId) => {
  const { data } = usePeerList()
  const [ret, setRet] = useState(null)
  if (ret) {
    return ret
  }
  if (!data) {
    return null
  }
  let candidate = data.dataProviders.find((i) => i.peerId === peerId)
  if (!candidate) {
    candidate = data.lifecycleManagers.find((i) => i.peerId === peerId)
  }
  if (candidate) {
    setRet(candidate)
    return candidate
  }
  return null
}
