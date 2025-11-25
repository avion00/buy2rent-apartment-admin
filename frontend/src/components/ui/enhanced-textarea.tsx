import * as React from "react"
import { Sparkles } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/use-toast"

export interface EnhancedTextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {}

const EnhancedTextarea = React.forwardRef<HTMLTextAreaElement, EnhancedTextareaProps>(
  ({ className, value, onChange, ...props }, ref) => {
    const { toast } = useToast()
    const [internalValue, setInternalValue] = React.useState(value || "")

    React.useEffect(() => {
      setInternalValue(value || "")
    }, [value])

    const enhanceText = () => {
      const text = internalValue.toString()
      if (!text.trim()) {
        toast({
          title: "No text to enhance",
          description: "Please enter some text first.",
          variant: "destructive",
        })
        return
      }

      // Basic text enhancement without AI
      let enhanced = text
        // Fix multiple spaces
        .replace(/\s+/g, ' ')
        // Trim whitespace
        .trim()
        // Capitalize first letter of sentences
        .replace(/(^\w|[.!?]\s+\w)/g, (c) => c.toUpperCase())
        // Fix common typos
        .replace(/\bi\b/g, 'I')
        .replace(/\bim\b/gi, "I'm")
        .replace(/\bdont\b/gi, "don't")
        .replace(/\bcant\b/gi, "can't")
        .replace(/\bwont\b/gi, "won't")
        .replace(/\bdidnt\b/gi, "didn't")
        .replace(/\bisnt\b/gi, "isn't")
        .replace(/\barent\b/gi, "aren't")
        // Add period at end if missing
      
      if (enhanced && !enhanced.match(/[.!?]$/)) {
        enhanced += '.'
      }

      const syntheticEvent = {
        target: { value: enhanced },
      } as React.ChangeEvent<HTMLTextAreaElement>

      setInternalValue(enhanced)
      onChange?.(syntheticEvent)

      toast({
        title: "Text enhanced",
        description: "Your text has been formatted and improved.",
      })
    }

    const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      setInternalValue(e.target.value)
      onChange?.(e)
    }

    return (
      <div className="relative">
        <textarea
          className={cn(
            "flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
            className
          )}
          ref={ref}
          value={internalValue}
          onChange={handleChange}
          {...props}
        />
        <Button
          type="button"
          size="icon"
          variant="ghost"
          className="absolute top-2 right-2 h-6 w-6"
          onClick={enhanceText}
          title="Enhance text"
        >
          <Sparkles className="h-4 w-4" />
        </Button>
      </div>
    )
  }
)
EnhancedTextarea.displayName = "EnhancedTextarea"

export { EnhancedTextarea }
