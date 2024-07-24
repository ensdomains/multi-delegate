import { Helper, Profile, Typography } from '@ensdomains/thorin'
import { useConnectModal } from '@rainbow-me/rainbowkit'
import { Link } from 'react-router-dom'
import { useAccount, useDisconnect, useEnsAvatar, useEnsName } from 'wagmi'

import logo from '../assets/logo.svg'
import profileIcon from '../assets/profileIcon.svg'

export function Nav() {
  const { address } = useAccount()
  const { data: ensName } = useEnsName({ address })
  const { data: ensAvatar } = useEnsAvatar({ name: ensName || undefined })
  const { openConnectModal } = useConnectModal()
  const { disconnect } = useDisconnect()

  return (
    <div>
      <Helper type="warning" alignment="horizontal" className="mb-4">
        Use this JSON RPC in your wallet:
        https://virtual.mainnet.rpc.tenderly.co/78d3d569-cb63-45a9-8b8c-9d152d90c3ed
      </Helper>

      <nav className="flex justify-between gap-4">
        <div className="flex items-center gap-6">
          <Link to="/">
            <img src={logo} alt="logo" />
          </Link>

          <div className="flex gap-4">
            <Link to="https://ensdao.org/">
              <Typography asProp="span" color="grey" weight="bold">
                DAO
              </Typography>
            </Link>
            <Link to="https://app.ens.domains/">
              <Typography asProp="span" color="grey" weight="bold">
                App
              </Typography>
            </Link>
          </div>
        </div>

        {address ? (
          <Profile
            size="medium"
            address={address}
            ensName={ensName || undefined}
            avatar={ensAvatar || undefined}
            onClick={openConnectModal}
            dropdownItems={[
              {
                label: 'Disconnect',
                onClick: () => disconnect(),
                color: 'red',
              },
            ]}
          />
        ) : (
          <img
            className="transition hover:-translate-y-[1px] hover:opacity-75"
            src={profileIcon}
            onClick={openConnectModal}
          />
        )}
      </nav>
    </div>
  )
}
