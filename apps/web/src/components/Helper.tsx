// Thorin's <Helper /> with an added success type
// https://thorin.ens.domains/components/molecules/Helper
import { Helper as ThorinHelper } from '@ensdomains/thorin'

import { cn } from '../lib/utils'

type Props = {
  type?: 'info' | 'warning' | 'error' | 'success'
  alignment?: 'horizontal' | 'vertical'
  children: React.ReactNode
  className?: string
}

export function Helper({ alignment, type, children, className }: Props) {
  if (type === 'success') {
    return (
      <div
        className={cn([
          'bg-ens-green-surface border-ens-green-primary flow-col flex w-full justify-center rounded-lg border p-4',
          className,
        ])}
      >
        {children}
      </div>
    )
  }

  return (
    <ThorinHelper
      type={type || 'info'}
      alignment={alignment || 'vertical'}
      className={className}
    >
      {children}
    </ThorinHelper>
  )
}
