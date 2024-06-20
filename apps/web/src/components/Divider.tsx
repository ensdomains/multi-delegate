import clsx from 'clsx'

export function Divider({
  className,
}: {
  className?: React.HTMLAttributes<HTMLHRElement>['className']
}) {
  return (
    <hr className={clsx('border-ens-additional-border w-full', className)} />
  )
}
