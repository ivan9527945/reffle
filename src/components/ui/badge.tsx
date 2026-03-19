import { cn } from '../../lib/utils'

interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'btc' | 'success' | 'destructive'
}

function Badge({ className, variant = 'default', ...props }: BadgeProps) {
  return (
    <div
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium',
        {
          'border-border bg-card text-foreground': variant === 'default',
          'border-btc/40 bg-btc/10 text-btc': variant === 'btc',
          'border-green-500/40 bg-green-500/10 text-green-400': variant === 'success',
          'border-red-500/40 bg-red-500/10 text-red-400': variant === 'destructive',
        },
        className
      )}
      {...props}
    />
  )
}

export { Badge }
