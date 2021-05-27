import { typesChain } from '@phala/typedefs'

export const chainTypes = typesChain['Phala Development']

export const bridgeTypes = {
  SetId: 'u64',
  StorageProof: 'Vec<Vec<u8>>',
  VersionedAuthorityList: {
    version: 'u8',
    authorityList: 'AuthorityList',
  },
  AuthoritySet: {
    authoritySet: 'AuthorityList',
    setId: 'SetId',
  },
  AuthoritySetChange: {
    authoritySet: 'AuthoritySet',
    authorityProof: 'StorageProof',
  },
  ReqHeaderToSync: {
    header: 'Header',
    justification: 'Option<EncodedJustification>',
  },
  ReqGenesisInfo: {
    header: 'Header',
    validators: 'AuthorityList',
    proof: 'StorageProof',
  },
  ReqBlockHeaderWithEvents: {
    blockHeader: 'Header',
    events: 'Option<Vec<u8>>',
    proof: 'Option<StorageProof>',
    workerSnapshot: 'Option<OnlineWorkerSnapshot>',
  },
  EncodedU8StorageKey: 'Vec<u8>',
  OnlineWorkerSnapshot: {
    workerStateKv: 'Vec<(EncodedU8StorageKey, WorkerInfo)>',
    stakeReceivedKv: 'Vec<(EncodedU8StorageKey, Balance)>',
    onlineWorkersKv: '(EncodedU8StorageKey, u32)',
    computeWorkersKv: '(EncodedU8StorageKey, u32)',
    proof: 'StorageProof',
  },
  StashWorkerStats: {
    slash: 'Balance',
    computeReceived: 'Balance',
    onlineReceived: 'Balance',
  },
  SignedWorkerMessage: {
    data: 'WorkerMessage',
    signature: 'Vec<u8>',
  },
  WorkerMessage: {
    payload: 'WorkerMessagePayload',
    sequence: 'u64',
  },
  WorkerMessagePayload: {
    _enum: {
      Heartbeat: 'WorkerMessagePayloadHeartbeat',
    },
  },
  WorkerMessagePayloadHeartbeat: {
    blockNum: 'u32',
    claimOnline: 'bool',
    claimCompute: 'bool',
  },
}

export const phalaTypes = {
  ...chainTypes,
  ...bridgeTypes,
}

export default phalaTypes
