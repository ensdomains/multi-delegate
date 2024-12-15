import React from 'react'
import { describe, expect, it } from 'vitest'

import { render, screen } from '../test/test-utils'
import { Helper } from './Helper'

describe('Helper component', () => {
  it('renders children correctly', () => {
    render(<Helper>Test content</Helper>)
    expect(screen.getByText('Test content')).toBeTruthy()
  })

  it('renders success type correctly', () => {
    render(<Helper type="success">Success message</Helper>)
    const successDiv = screen.getByText('Success message')
    expect(successDiv).toBeTruthy()
    expect(successDiv).toHaveProperty(
      'className',
      'bg-ens-green-surface border-ens-green-primary flow-col flex w-full justify-center rounded-lg border p-4'
    )
  })
})
