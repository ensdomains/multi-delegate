export const GRAPH_URL =
  import.meta.env.VITE_PUBLIC_GRAPH_URL ||
  'https://api.thegraph.com/subgraphs/name/ensdomains/ens'

export const RPC_URL =
  import.meta.env.VITE_PUBLIC_RPC_URL ||
  'https://virtual.mainnet.rpc.tenderly.co/c5b762a9-addb-468c-ad6a-f11c0df62605'

export const PONDER_URL =
  (import.meta.env.VITE_PUBLIC_PONDER_URL as string) || undefined
