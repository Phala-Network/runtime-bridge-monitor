import axios from 'axios'

const query = async (url, data) => {
  const {
    data: { content },
  } = await axios({
    method: 'POST',
    url,
    data,
    responseType: 'json',
  })
  if (content.error) {
    content.error.isProtoError = true
    throw content.error
  }
  return content
}

export const queryManager = ({ queryKey: [data] }) => {
  return query('/api/query_manager', data)
}

export const queryFetcher = ({ queryKey: [data] }) => {
  return query('/api/query_fetcher', data)
}

export const CALL_ONLINE_LIFECYCLE_MANAGER = {
  callOnlineLifecycleManager: {},
}
