import path from 'path'
import protobuf from 'protobufjs'

const protoPath = path.join(process.cwd(), './vendor/proto/message.proto')
const protoRoot = protobuf.loadSync(protoPath)

if (process.env.NODE_ENV === 'development') {
  globalThis.protoRoot = protoRoot
}

export const Message = protoRoot.lookup('prb.Message')
export const MessageType = protoRoot.lookup('prb.MessageType')
export const MessageTarget = protoRoot.lookup('prb.MessageTarget')

export { protoRoot }
