export const GRAPH_URL =
  import.meta.env.VITE_GRAPH_URL ||
  'https://api.thegraph.com/subgraphs/name/ensdomains/ens'

export const RPC_URL =
  import.meta.env.VITE_RPC_URL || 'https://ethereum-rpc.publicnode.com'

export const PONDER_URL = import.meta.env.VITE_PONDER_URL

export const REOWN_PROJECT_ID =
  (import.meta.env.VITE_REOWN_PROJECT_ID as string) || ''
