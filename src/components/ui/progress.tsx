import * as ProgressPrimitive from '@radix-ui/react-progress'
import { cn } from '../../lib/utils'

function Progress({
  className,
  value,
  ...props
}: React.ComponentPropsWithoutRef<typeof ProgressPrimitive.Root>) {
  return (
    <ProgressPrimitive.Root
      className={cn('progress-root', className)}
      {...props}
    >
      <ProgressPrimitive.Indicator
        className="progress-indicator"
        style={{ transform: `translateX(-${100 - (value ?? 0)}%)` }}
      />
    </ProgressPrimitive.Root>
  )
}

export { Progress }
