import clsx from 'clsx'

type Props = {
  children: React.ReactNode
  className?: React.HTMLAttributes<HTMLDivElement>['className']
}

export function InnerCard({ children, className }: Props) {
  return (
    <div
      className={clsx(
        'bg-ens-grey-surface rounded-lg p-4 text-center',
        className
      )}
    >
      {children}
    </div>
  )
}
