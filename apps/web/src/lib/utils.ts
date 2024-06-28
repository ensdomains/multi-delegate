import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'
import { formatUnits } from 'viem/utils'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const NULL = '0x0000000000000000000000000000000000000000'

export function truncateAddress(address: string) {
  return `${address.slice(0, 6)}...${address.slice(-4)}`
}

// prettier-ignore
export function formatNumber(amount: bigint | undefined, returnType: 'string'): string
// prettier-ignore
export function formatNumber(amount: bigint | undefined, returnType: 'number'): number
export function formatNumber(
  amount: bigint | undefined,
  returnType: 'string' | 'number'
) {
  const data = new Intl.NumberFormat('en-US', {
    style: 'decimal',
    maximumFractionDigits: 2,
  }).format(Number(formatUnits(amount || 0n, 18)))

  return returnType === 'number' ? Number(data) : data
}
