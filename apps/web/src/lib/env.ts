export const GRAPH_URL =
  import.meta.env.VITE_PUBLIC_GRAPH_URL ||
  'https://api.thegraph.com/subgraphs/name/ensdomains/ens'

export const RPC_URL =
  import.meta.env.VITE_PUBLIC_RPC_URL ||
  'https://virtual.mainnet.rpc.tenderly.co/42ae08fb-9b54-410b-8c4a-e9ad3334b8ee'

export const PONDER_URL =
  (import.meta.env.VITE_PUBLIC_PONDER_URL as string) || undefined
