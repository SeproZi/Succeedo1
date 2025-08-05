'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from '@/components/ui/dialog';
import { Skeleton } from '@/components/ui/skeleton';
import { Sparkles, Plus } from 'lucide-react';
import type { OkrItem } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';

type AiSuggestionsDialogProps = {
  isOpen: boolean;
  setOpen: (isOpen: boolean) => void;
  objective: OkrItem;
  onAddKR: (krTitle: string) => void;
  suggestAction: (objective: OkrItem) => Promise<string[]>;
};

export function AiSuggestionsDialog({
  isOpen,
  setOpen,
  objective,
  onAddKR,
  suggestAction,
}: AiSuggestionsDialogProps) {
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (isOpen) {
      setIsLoading(true);
      setSuggestions([]);
      suggestAction(objective)
        .then(results => {
          setSuggestions(results);
        })
        .catch(error => {
          console.error('Failed to get suggestions:', error);
          toast({
            variant: "destructive",
            title: "Error",
            description: "Could not fetch AI suggestions. Please check the console for details.",
          });
        })
        .finally(() => {
          setIsLoading(false);
        });
    }
  }, [isOpen, objective, suggestAction, toast]);

  const handleAddClick = (suggestion: string) => {
    onAddKR(suggestion);
    toast({
        title: "Key Result Added",
        description: `Added "${suggestion}" to your objective.`,
    })
  };

  return (
    <Dialog open={isOpen} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 font-headline">
            <Sparkles className="h-5 w-5 text-accent" />
            AI-Suggested Key Results
          </DialogTitle>
          <DialogDescription>
            For objective: <span className="font-semibold">{objective.title}</span>
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3 py-4 max-h-[400px] overflow-y-auto">
          {isLoading && (
            <>
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
            </>
          )}
          {!isLoading && suggestions.length === 0 && (
             <p className="text-center text-muted-foreground">No suggestions available.</p>
          )}
          {suggestions.map((suggestion, index) => (
            <div
              key={index}
              className="flex items-center justify-between gap-2 p-2 rounded-md bg-secondary"
            >
              <p className="text-sm flex-1">{suggestion}</p>
              <Button size="sm" variant="outline" onClick={() => handleAddClick(suggestion)}>
                <Plus className="h-4 w-4 mr-1" />
                Add
              </Button>
            </div>
          ))}
        </div>

        <DialogFooter>
          <Button type="button" variant="ghost" onClick={() => setOpen(false)}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
