import React from 'react'
import { describe, expect, it } from 'vitest'

import { render, screen } from '../test/test-utils'
import { SmallCard } from './SmallCard'

describe('SmallCard', () => {
  it('renders children correctly', () => {
    render(<SmallCard>Test content</SmallCard>)
    expect(screen.getByText('Test content')).toBeTruthy()
  })

  it('applies custom className', () => {
    render(<SmallCard className="custom-class">Content</SmallCard>)
    const card = screen.getByText('Content').closest('div')
    expect(card).toHaveClass('custom-class')
  })

  it('renders Divider component', () => {
    render(
      <SmallCard>
        <SmallCard.Divider />
      </SmallCard>
    )
    expect(screen.getByRole('separator')).toBeTruthy()
  })
})
