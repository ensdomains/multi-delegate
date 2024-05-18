import { formatUnits } from 'viem/utils'

export const NULL = '0x0000000000000000000000000000000000000000'

export function truncateAddress(address: string) {
  return `${address.slice(0, 6)}...${address.slice(-4)}`
}

export function formatNumber(amount: bigint | undefined) {
  return new Intl.NumberFormat('en-US', {
    style: 'decimal',
    maximumFractionDigits: 2,
  }).format(Number(formatUnits(amount || 0n, 18)))
}
