import React from 'react'
import { describe, expect, it } from 'vitest'

import { render } from '../test/test-utils'
import { Divider } from './Divider'

describe('Divider', () => {
  it('renders correctly with default props', () => {
    const { container } = render(<Divider />)
    const hr = container.querySelector('hr')
    expect(hr).toBeTruthy()
    expect(hr).toHaveProperty(
      'className',
      'border-ens-additional-border w-full'
    )
  })

  it('applies additional className when provided', () => {
    const { container } = render(<Divider className="custom-class" />)
    const hr = container.querySelector('hr')
    expect(hr).toBeTruthy()
    expect(hr).toHaveProperty(
      'className',
      'border-ens-additional-border w-full custom-class'
    )
  })
})
