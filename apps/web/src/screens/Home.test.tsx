import React from 'react'
import { describe, expect, it } from 'vitest'

import { render, screen } from '../test/test-utils'
import { Home } from './Home'

describe('Home component', () => {
  it('renders the title correctly', () => {
    render(<Home />)
    const titleElement = screen.getByText('ENS Delegation Manager')
    expect(titleElement).toBeDefined()
    expect(titleElement.tagName).toBe('H1')
  })

  it('renders the subtitle', () => {
    render(<Home />)
    const subtitleElement = screen.getByText(
      'Participate in the ENS DAO by delegating your $ENS.'
    )
    expect(subtitleElement).toBeDefined()
  })

  it('renders the description text', () => {
    render(<Home />)
    const descriptionElement = screen.getByText(
      /With this platform you can easily split your votes/
    )
    expect(descriptionElement).toBeDefined()
  })

  it('renders the Start button with correct link', () => {
    render(<Home />)
    const startButton = screen.getByRole('link', { name: 'Start' })
    expect(startButton).toBeDefined()
    expect(startButton.getAttribute('href')).toBe('/strategy')
  })
})
