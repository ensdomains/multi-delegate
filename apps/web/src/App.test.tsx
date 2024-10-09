import { describe, expect, it } from 'vitest'

// New mock for react-router-dom
import App from './App'
import { render, screen } from './test/test-utils'

describe('App', () => {
  it('renders without crashing and displays expected text', () => {
    render(<App />)

    // Check for specific text
    expect(screen.getByText('ENS Delegation Manager')).toBeTruthy()
    expect(
      screen.getByText('Participate in the ENS DAO by delegating your $ENS.')
    ).toBeTruthy()

    // Check for partial text match
    expect(
      screen.getByText(/With this platform you can easily split your votes/)
    ).toBeTruthy()

    // Check for button text
    expect(screen.getByRole('link', { name: 'Start' })).toBeTruthy()
  })
})
