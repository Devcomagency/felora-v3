import * as React from "react"
import { cn } from "../../utils/cn"

interface GlassCardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'intense' | 'subtle'
  gradient?: boolean
}

const GlassCard = React.forwardRef<HTMLDivElement, GlassCardProps>(
  ({ className, variant = 'default', gradient = false, children, ...props }, ref) => {
    const variants = {
      default: "bg-white/5 backdrop-blur-xl border border-white/10",
      intense: "bg-white/10 backdrop-blur-3xl border border-white/20",
      subtle: "bg-white/[0.02] backdrop-blur-md border border-white/5",
    }

    return (
      <div
        ref={ref}
        className={cn(
          "rounded-2xl shadow-2xl transition-all duration-300 hover:shadow-xl hover:bg-white/[0.07]",
          variants[variant],
          gradient && "bg-gradient-to-br from-white/10 to-white/5",
          className
        )}
        style={{
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.1)',
        }}
        {...props}
      >
        {children}
      </div>
    )
  }
)
GlassCard.displayName = "GlassCard"

export { GlassCard }