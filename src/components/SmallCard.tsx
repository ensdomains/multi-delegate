import { Card } from '@ensdomains/thorin'
import clsx from 'clsx'

type Props = {
  children: React.ReactNode
  className?: React.HTMLAttributes<HTMLDivElement>['className']
}

function Parent({ children, className }: Props) {
  return <Card className={clsx('!rounded-lg !p-4', className)}>{children}</Card>
}

function Divider() {
  return <hr className="border-ens-additional-border mx-[-1rem]" />
}

export const SmallCard = Object.assign(Parent, { Divider })
