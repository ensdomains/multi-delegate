import { Profile } from '@ensdomains/thorin'
import { useConnectModal } from '@rainbow-me/rainbowkit'
import { Link } from 'react-router-dom'
import { useAccount } from 'wagmi'

import logo from '../assets/logo.svg'
import profileIcon from '../assets/profileIcon.svg'

export function Nav() {
  const { address } = useAccount()
  const { openConnectModal } = useConnectModal()

  return (
    <nav>
      <div>
        <Link to="/">
          <img src={logo} alt="logo" />
        </Link>

        <div>
          <Link to="/delegate">Delegate</Link>
          <Link to="https://ensdao.org/">Governance</Link>
          <Link to="https://support.ens.domains/">Learn</Link>
        </div>
      </div>

      {address ? (
        <Profile size="medium" address={address} />
      ) : (
        <img src={profileIcon} onClick={openConnectModal} />
      )}
    </nav>
  )
}
