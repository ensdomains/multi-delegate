import dotenv from 'dotenv'
import { Account, Address, Hex } from 'viem'
import { nonceManager, privateKeyToAccount } from 'viem/accounts'

dotenv.config()

// Use Anvil accounts
// Safe to use in tests
const PREDEFINED_ACCOUNTS: { address: Address; privateKey: Hex }[] = [
  {
    address: '0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266',
    privateKey:
      '0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80',
  },
  {
    address: '0x70997970C51812dc3A010C7d01b50e0d17dc79C8',
    privateKey:
      '0x59c6995e998f97a5a0044966f0945389dc9e86dae88c7a8412f4603b6b78690d',
  },
  {
    address: '0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC',
    privateKey:
      '0x5de4111afa1a4b94908f83103eb1f1706367c2e68ca870fc3fb9a804cdab365a',
  },
]

function shortenAddress(
  address: Address | string,
  maxLength: number = 10,
  leftSlice: number = 5,
  rightSlice: number = 5
): string {
  if (address.length < maxLength) {
    return address
  }
  return `${address.slice(0, leftSlice)}...${address.slice(-rightSlice)}`
}

export type Accounts = ReturnType<typeof createAccounts>

export type User = 'user' | 'user2' | 'user3'

export const createAccounts = () => {
  const users: User[] = ['user', 'user2', 'user3']

  const accounts: Account[] = PREDEFINED_ACCOUNTS.map(({ privateKey }) =>
    privateKeyToAccount(privateKey, { nonceManager })
  )
  const privateKeys: Hex[] = PREDEFINED_ACCOUNTS.map(
    ({ privateKey }) => privateKey
  )
  const addresses: Address[] = PREDEFINED_ACCOUNTS.map(
    ({ address }) => address as Address
  )

  function getAddress(user: User): Address
  function getAddress(user: User, length: number): string
  function getAddress(user: User, length?: number): Address | string {
    const index = users.indexOf(user)
    if (index < 0) throw new Error(`User not found: ${user}`)
    const address = addresses[index]
    if (!address) throw new Error(`Address not found: ${user}`)
    if (length) return shortenAddress(address, length)
    return address
  }

  return {
    getAccountForUser: (user: User) => {
      const index = users.indexOf(user)
      if (index < 0) throw new Error(`User not found: ${user}`)
      return accounts[index]
    },
    getAllPrivateKeys: () => privateKeys,
    getAddress,
    getPrivateKey: (user: User) => {
      const index = users.indexOf(user)
      if (index < 0) throw new Error(`User not found: ${user}`)
      return privateKeys[index]
    },
  }
}