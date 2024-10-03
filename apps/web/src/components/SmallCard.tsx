import { Card } from '@ensdomains/thorin'

import { Divider as BaseDivider } from '../components/Divider'
import { cn } from '../lib/utils'

type Props = {
  children: React.ReactNode
  className?: React.HTMLAttributes<HTMLDivElement>['className']
}

function Parent({ children, className }: Props) {
  return <Card className={cn('!rounded-lg !p-4', className)}>{children}</Card>
}

function Divider() {
  return <BaseDivider className="-mx-4 w-[calc(100%+2rem)]" />
}

export const SmallCard = Object.assign(Parent, { Divider })
