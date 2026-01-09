import * as React from "react"
import { cn } from "@/lib/utils"
import { AITextEnhancer } from "@/components/ui/AITextEnhancer"

export interface EnhancedTextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {}

const EnhancedTextarea = React.forwardRef<HTMLTextAreaElement, EnhancedTextareaProps>(
  ({ className, value, onChange, ...props }, ref) => {
    const [internalValue, setInternalValue] = React.useState(value || "")

    React.useEffect(() => {
      setInternalValue(value || "")
    }, [value])

    const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      setInternalValue(e.target.value)
      onChange?.(e)
    }

    const handleTextEnhanced = (enhancedText: string) => {
      const syntheticEvent = {
        target: { value: enhancedText },
      } as React.ChangeEvent<HTMLTextAreaElement>

      setInternalValue(enhancedText)
      onChange?.(syntheticEvent)
    }

    return (
      <div className="relative">
        <textarea
          className={cn(
            "flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 pr-24 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
            className
          )}
          ref={ref}
          value={internalValue}
          onChange={handleChange}
          {...props}
        />
        <div className="absolute top-2 right-2">
          <AITextEnhancer
            text={internalValue.toString()}
            onTextEnhanced={handleTextEnhanced}
            variant="ghost"
            size="sm"
          />
        </div>
      </div>
    )
  }
)
EnhancedTextarea.displayName = "EnhancedTextarea"

export { EnhancedTextarea }
