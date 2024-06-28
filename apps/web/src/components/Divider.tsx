import { cn } from '../lib/utils'

export function Divider({
  className,
}: {
  className?: React.HTMLAttributes<HTMLHRElement>['className']
}) {
  return <hr className={cn('border-ens-additional-border w-full', className)} />
}
