'use client';

import { useState, useTransition } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import type { OkrItem } from '@/lib/types';
import { Lightbulb, Plus, AlertTriangle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { suggestKeyResultsAction } from '@/lib/actions';

type AiSuggestionsDialogProps = {
  isOpen: boolean;
  setOpen: (isOpen: boolean) => void;
  objective: OkrItem;
  onAddKeyResult: (title: string) => void;
};

export function AiSuggestionsDialog({
  isOpen,
  setOpen,
  objective,
  onAddKeyResult,
}: AiSuggestionsDialogProps) {
  const [isPending, startTransition] = useTransition();
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const handleGetSuggestions = () => {
    startTransition(async () => {
      setError(null);
      const result = await suggestKeyResultsAction({ objective: objective.title });
      if (result.error) {
        setError(result.error);
      } else {
        setSuggestions(result.keyResults || []);
      }
    });
  };

  const handleAddAndClose = (title: string) => {
    onAddKeyResult(title);
    toast({
      title: "Key Result Added",
      description: `"${title}" has been added to your objective.`,
    });
    const newSuggestions = suggestions.filter(s => s !== title);
    if(newSuggestions.length === 0) {
        setOpen(false);
    }
    setSuggestions(newSuggestions);

  };

  return (
    <Dialog open={isOpen} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="font-headline flex items-center gap-2">
            <Lightbulb className="h-6 w-6 text-accent" />
            AI Key Result Suggestions
          </DialogTitle>
          <DialogDescription>
            For objective: <span className="font-semibold text-primary">{objective.title}</span>
          </DialogDescription>
        </DialogHeader>

        <div className="my-4">
          {error && (
             <Alert variant="destructive">
                <AlertTriangle className="h-4 w-4" />
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          {isPending ? (
            <div className="space-y-3">
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
            </div>
          ) : suggestions.length > 0 ? (
            <ScrollArea className="h-60">
              <div className="space-y-2 pr-4">
                {suggestions.map((suggestion, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between gap-2 rounded-lg border p-3"
                  >
                    <p className="text-sm text-foreground flex-1">{suggestion}</p>
                    <Button size="sm" variant="outline" onClick={() => handleAddAndClose(suggestion)}>
                      <Plus className="h-4 w-4 mr-1" /> Add
                    </Button>
                  </div>
                ))}
              </div>
            </ScrollArea>
          ) : (
            <div className="text-center p-4 border-dashed border-2 rounded-lg">
                <p className="text-muted-foreground">Click the button below to generate suggestions.</p>
            </div>
          )}
        </div>

        <DialogFooter className="sm:justify-between">
            <Button variant="ghost" onClick={() => setOpen(false)}>Close</Button>
            <Button
                onClick={handleGetSuggestions}
                disabled={isPending}
                className="bg-accent hover:bg-accent/90 text-accent-foreground"
            >
                {isPending ? 'Generating...' : 'Generate Suggestions'}
            </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
