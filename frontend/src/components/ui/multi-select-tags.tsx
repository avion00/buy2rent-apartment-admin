import { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { X, Plus, Check } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuCheckboxItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { ScrollArea } from '@/components/ui/scroll-area';

interface MultiSelectTagsProps {
  options: string[];
  value: string[];
  onChange: (value: string[]) => void;
  placeholder?: string;
  className?: string;
  allowCustom?: boolean;
  customPlaceholder?: string;
}

export function MultiSelectTags({ 
  options, 
  value = [], 
  onChange, 
  placeholder = "Add status...",
  className,
  allowCustom = false,
  customPlaceholder = "Enter custom value..."
}: MultiSelectTagsProps) {
  const [open, setOpen] = useState(false);
  const [customInput, setCustomInput] = useState('');
  const [showCustomInput, setShowCustomInput] = useState(false);

  const handleToggle = (option: string) => {
    if (option === 'Other (Custom)' && allowCustom) {
      setShowCustomInput(true);
      return;
    }
    if (value.includes(option)) {
      onChange(value.filter(v => v !== option));
    } else {
      onChange([...value, option]);
    }
  };

  const handleAddCustom = () => {
    if (customInput.trim()) {
      onChange([...value, customInput.trim()]);
      setCustomInput('');
      setShowCustomInput(false);
      setOpen(false);
    }
  };

  const handleRemove = (option: string, e: React.MouseEvent) => {
    e.stopPropagation();
    onChange(value.filter(v => v !== option));
  };

  return (
    <div className={cn("flex flex-col gap-2", className)}>
      <div className="flex flex-wrap gap-1 min-h-[32px]">
        {value.map((tag) => (
          <Badge
            key={tag}
            variant="secondary"
            className="pl-2 pr-1 py-1 text-xs flex items-center gap-1"
          >
            {tag}
            <button
              type="button"
              className="h-4 w-4 p-0 hover:bg-transparent inline-flex items-center justify-center rounded-sm hover:opacity-70"
              onClick={(e) => handleRemove(tag, e)}
            >
              <X className="h-3 w-3" />
            </button>
          </Badge>
        ))}
      </div>
      
      <DropdownMenu open={open} onOpenChange={setOpen}>
        <DropdownMenuTrigger asChild>
          <Button
            variant="outline"
            size="sm"
            className="w-full justify-start text-left font-normal"
            type="button"
          >
            <Plus className="mr-2 h-3 w-3" />
            {placeholder}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent 
          className="w-[250px] p-0 max-h-[300px] overflow-hidden"
          align="start"
          side="bottom"
        >
          {showCustomInput ? (
            <div className="p-3 space-y-2">
              <input
                type="text"
                value={customInput}
                onChange={(e) => setCustomInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    handleAddCustom();
                  } else if (e.key === 'Escape') {
                    setShowCustomInput(false);
                    setCustomInput('');
                  }
                }}
                placeholder={customPlaceholder}
                className="w-full px-3 py-2 text-sm border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                autoFocus
              />
              <div className="flex gap-2">
                <Button
                  type="button"
                  size="sm"
                  onClick={handleAddCustom}
                  className="flex-1"
                >
                  Add
                </Button>
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    setShowCustomInput(false);
                    setCustomInput('');
                  }}
                >
                  Cancel
                </Button>
              </div>
            </div>
          ) : (
            <ScrollArea className="h-full max-h-[300px]">
              <div className="p-1">
                {options.map((option) => (
                  <DropdownMenuCheckboxItem
                    key={option}
                    checked={value.includes(option)}
                    onCheckedChange={() => handleToggle(option)}
                    onSelect={(e) => e.preventDefault()}
                    className="cursor-pointer"
                  >
                    <span className="flex-1">{option}</span>
                    {value.includes(option) && (
                      <Check className="h-4 w-4 ml-2" />
                    )}
                  </DropdownMenuCheckboxItem>
                ))}
              </div>
            </ScrollArea>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
