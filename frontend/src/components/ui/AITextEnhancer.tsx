import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Sparkles, Loader2 } from 'lucide-react';
import { useAITextEnhancement, EnhancementType } from '@/hooks/useAITextEnhancement';

interface AITextEnhancerProps {
  text: string;
  onTextEnhanced: (enhancedText: string) => void;
  className?: string;
  variant?: 'default' | 'outline' | 'ghost' | 'secondary';
  size?: 'default' | 'sm' | 'lg' | 'icon';
}

export const AITextEnhancer = ({
  text,
  onTextEnhanced,
  className = '',
  variant = 'outline',
  size = 'sm',
}: AITextEnhancerProps) => {
  const { enhanceText, isEnhancing } = useAITextEnhancement();
  const [open, setOpen] = useState(false);

  const handleEnhance = async (type: EnhancementType) => {
    setOpen(false);
    const enhanced = await enhanceText(text, type);
    if (enhanced) {
      onTextEnhanced(enhanced);
    }
  };

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <Button
          type="button"
          variant={variant}
          size={size}
          className={className}
          disabled={isEnhancing || !text?.trim()}
        >
          {isEnhancing ? (
            <>
              <Loader2 className="h-4 w-4  animate-spin" />
            </>
          ) : (
            <>
              <Sparkles className="h-4 w-4 " />
            </>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => handleEnhance('improve')}>
          <Sparkles className="h-4 w-4 mr-2" />
          Improve & Fix
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleEnhance('shorten')}>
          <Sparkles className="h-4 w-4 mr-2" />
          Make Shorter
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleEnhance('professional')}>
          <Sparkles className="h-4 w-4 mr-2" />
          Professional Tone
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleEnhance('friendly')}>
          <Sparkles className="h-4 w-4 mr-2" />
          Friendly Tone
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleEnhance('translate')}>
          <Sparkles className="h-4 w-4 mr-2" />
          Translate to English
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
