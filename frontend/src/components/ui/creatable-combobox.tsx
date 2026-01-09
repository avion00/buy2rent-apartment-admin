import * as React from "react";
import { Check, ChevronsUpDown, Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export interface ComboboxOption {
  value: string;
  label: string;
}

interface CreatableComboboxProps {
  options: ComboboxOption[];
  value?: string;
  onValueChange: (value: string) => void;
  onCreate?: (name: string) => Promise<{ id: string; name: string }>;
  onNavigateToCreate?: () => void;
  placeholder?: string;
  searchPlaceholder?: string;
  emptyText?: string;
  createText?: string;
  isLoading?: boolean;
  disabled?: boolean;
  className?: string;
}

export function CreatableCombobox({
  options,
  value,
  onValueChange,
  onCreate,
  onNavigateToCreate,
  placeholder = "Select option...",
  searchPlaceholder = "Search...",
  emptyText = "No results found.",
  createText = "Create new",
  isLoading = false,
  disabled = false,
  className,
}: CreatableComboboxProps) {
  const [open, setOpen] = React.useState(false);
  const [dialogOpen, setDialogOpen] = React.useState(false);
  const [newItemName, setNewItemName] = React.useState("");
  const [isCreating, setIsCreating] = React.useState(false);
  const [searchValue, setSearchValue] = React.useState("");

  const selectedOption = options.find((option) => option.value === value);

  const handleCreate = async () => {
    if (!newItemName.trim()) return;

    setIsCreating(true);
    try {
      if (onCreate) {
        const newItem = await onCreate(newItemName.trim());
        onValueChange(newItem.id);
        setDialogOpen(false);
        setNewItemName("");
        setOpen(false);
      }
    } catch (error) {
      console.error("Error creating item:", error);
    } finally {
      setIsCreating(false);
    }
  };

  const handleCreateClick = () => {
    if (onNavigateToCreate) {
      // Navigate to create page instead of showing dialog
      onNavigateToCreate();
      setOpen(false);
    } else {
      // Show inline creation dialog
      setDialogOpen(true);
      setNewItemName(searchValue);
    }
  };

  return (
    <>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className={cn("w-full justify-between", className)}
            disabled={disabled || isLoading}
          >
            {isLoading ? (
              "Loading..."
            ) : selectedOption ? (
              selectedOption.label
            ) : (
              <span className="text-muted-foreground">{placeholder}</span>
            )}
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-full p-0" align="start">
          <Command>
            <CommandInput 
              placeholder={searchPlaceholder} 
              value={searchValue}
              onValueChange={setSearchValue}
            />
            <CommandList>
              <CommandEmpty>
                <div className="text-sm text-muted-foreground py-2">
                  {emptyText}
                </div>
              </CommandEmpty>
              <CommandGroup>
                {options.map((option) => (
                  <CommandItem
                    key={option.value}
                    value={option.value}
                    onSelect={(currentValue) => {
                      onValueChange(currentValue === value ? "" : currentValue);
                      setOpen(false);
                    }}
                  >
                    <Check
                      className={cn(
                        "mr-2 h-4 w-4",
                        value === option.value ? "opacity-100" : "opacity-0"
                      )}
                    />
                    {option.label}
                  </CommandItem>
                ))}
              </CommandGroup>
              <CommandGroup>
                <CommandItem
                  onSelect={handleCreateClick}
                  className="text-primary"
                >
                  <Plus className="mr-2 h-4 w-4" />
                  {createText}
                  {searchValue && !onNavigateToCreate && ` "${searchValue}"`}
                </CommandItem>
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{createText}</DialogTitle>
            <DialogDescription>
              Enter a name for the new item. Click create when you're done.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                value={newItemName}
                onChange={(e) => setNewItemName(e.target.value)}
                placeholder="Enter name..."
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    handleCreate();
                  }
                }}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setDialogOpen(false);
                setNewItemName("");
              }}
              disabled={isCreating}
            >
              Cancel
            </Button>
            <Button onClick={handleCreate} disabled={isCreating || !newItemName.trim()}>
              {isCreating ? "Creating..." : "Create"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
