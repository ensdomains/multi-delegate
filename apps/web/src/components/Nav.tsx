import { Profile, Typography } from '@ensdomains/thorin'
import { useConnectModal } from '@rainbow-me/rainbowkit'
import { Link } from 'react-router-dom'
import { useAccount, useDisconnect } from 'wagmi'

import logo from '../assets/logo.svg'
import profileIcon from '../assets/profileIcon.svg'

export function Nav() {
  const { address } = useAccount()
  const { openConnectModal } = useConnectModal()
  const { disconnect } = useDisconnect()

  return (
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
  )
}
