export const GRAPH_URL =
  import.meta.env.VITE_PUBLIC_GRAPH_URL ||
  'https://api.thegraph.com/subgraphs/name/ensdomains/ens'

export const RPC_URL =
  import.meta.env.VITE_PUBLIC_RPC_URL ||
  'https://virtual.mainnet.rpc.tenderly.co/78d3d569-cb63-45a9-8b8c-9d152d90c3ed'

export const PONDER_URL = new URL(
  import.meta.env.VITE_PUBLIC_PONDER_URL || 'http://localhost:42069'
).origin
