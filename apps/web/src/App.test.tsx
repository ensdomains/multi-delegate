import { describe, expect, it } from 'vitest'

import App from './App'
import { render, screen } from './test/test-utils'

describe('App', () => {
  it('renders without crashing and displays expected text', () => {
    render(<App />)

    expect(screen.getByText('ENS Delegation Manager')).toBeTruthy()
    expect(
      screen.getByText('Participate in the ENS DAO by delegating your $ENS.')
    ).toBeTruthy()

    expect(
      screen.getByText(/With this platform you can easily split your votes/)
    ).toBeTruthy()

    expect(screen.getByRole('link', { name: 'Start' })).toBeTruthy()
  })
})
