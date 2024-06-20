import { Card } from '@ensdomains/thorin'
import clsx from 'clsx'

import { Divider as BaseDivider } from '../components/Divider'

type Props = {
  children: React.ReactNode
  className?: React.HTMLAttributes<HTMLDivElement>['className']
}

function Parent({ children, className }: Props) {
  return <Card className={clsx('!rounded-lg !p-4', className)}>{children}</Card>
}

function Divider() {
  return <BaseDivider className="mx-[-1rem]" />
}

export const SmallCard = Object.assign(Parent, { Divider })
