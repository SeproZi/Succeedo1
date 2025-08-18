
'use client';

import { useState } from 'react';
import {
  Target,
  CheckCircle2,
  MoreVertical,
  Plus,
  Trash2,
  Notebook,
  Check,
  Sparkles,
  ChevronDown,
} from 'lucide-react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Textarea } from '@/components/ui/textarea';
import type { OkrItem } from '@/lib/types';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { Slider } from '@/components/ui/slider';
import useOkrStore from '@/hooks/use-okr-store';
import { AiSuggestionsDialog } from './ai-suggestions-dialog';
import { suggestKeyResultsAction } from '@/lib/actions';

type OkrCardProps = {
  okr: OkrItem;
  allOkrs: OkrItem[];
  level: number;
  onAddOrUpdate: (data: Partial<OkrItem> | { parentId: string | null }) => void;
};

const KEY_RESULT_DISPLAY_LIMIT = 2;

export function OkrCard({
  okr,
  allOkrs,
  level,
  onAddOrUpdate,
}: OkrCardProps) {
  const { deleteOkr, updateOkrNotes, updateOkrProgress, addOkr } = useOkrStore();
  const isObjective = okr.type === 'objective';
  const children = allOkrs.filter(item => item.parentId === okr.id);
  const [notes, setNotes] = useState(okr.notes ?? '');
  const [isSuggestionsOpen, setSuggestionsOpen] = useState(false);
  const [isExpanded, setExpanded] = useState(false);
  const { toast } = useToast();
  
  const canCollapse = isObjective && children.length > KEY_RESULT_DISPLAY_LIMIT;
  const displayedChildren = canCollapse && !isExpanded ? children.slice(0, KEY_RESULT_DISPLAY_LIMIT) : children;

  const handleSaveNotes = () => {
    updateOkrNotes(okr.id, notes);
    toast({
        title: "Notes Saved",
        description: "Your notes have been successfully saved.",
    });
  };

  const handleMarkAsDone = () => {
    const newProgress = okr.progress === 100 ? 0 : 100;
    updateOkrProgress(okr.id, newProgress);
    toast({
        title: `Key Result ${newProgress === 100 ? 'Completed' : 'Reset'}`,
        description: `Progress set to ${newProgress}%`,
    });
  };

  const handleAddKRFromSuggestion = (krTitle: string) => {
    addOkr({
      title: krTitle,
      type: 'keyResult',
      parentId: okr.id,
      owner: okr.owner,
      year: okr.year,
      period: okr.period,
      priority: 'P3'
    });
    setSuggestionsOpen(false);
  };

  const icon = isObjective ? (
    <Target className="h-5 w-5 text-primary" />
  ) : (
    <CheckCircle2 className="h-5 w-5 text-green-500" />
  );
  
  return (
    <>
    <div style={{ marginLeft: level > 0 ? `${level * 1.25}rem` : '0' }}>
      <Card className="overflow-hidden shadow-sm hover:shadow-md transition-all duration-300">
        <CardHeader className="flex flex-row items-center justify-between p-3 bg-transparent">
          <div className="flex items-center gap-3 flex-1 min-w-0">
            {icon}
            <span className="font-headline font-semibold text-base truncate text-card-foreground">
              {okr.title}
            </span>
          </div>
          <div className="flex items-center gap-2 ml-2">
             {okr.type === 'keyResult' && (
                <div className="w-28 hidden sm:flex items-center gap-2">
                    <Progress value={okr.progress} className="h-1.5 flex-1" />
                    <span className="font-semibold text-primary w-10 text-right text-sm">
                        {okr.progress}%
                    </span>
                </div>
             )}
             {okr.type === 'objective' && (
                 <span className="font-semibold text-primary w-10 text-right text-sm">
                    {okr.progress}%
                 </span>
             )}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-7 w-7">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => onAddOrUpdate(okr)}>
                  Edit
                </DropdownMenuItem>
                {isObjective && (
                    <DropdownMenuItem onClick={() => setSuggestionsOpen(true)}>
                        <Sparkles className="mr-2 h-4 w-4" />
                        Suggest KRs with AI
                    </DropdownMenuItem>
                )}
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() => deleteOkr(okr.id)}
                  className="text-destructive focus:text-destructive"
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  <span>Delete</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </CardHeader>

        {!isObjective && (
          <CardContent className="p-3 pt-0 space-y-2">
             <div className="flex items-center gap-2">
                <Slider
                    value={[okr.progress]}
                    onValueChange={(value) => updateOkrProgress(okr.id, value[0])}
                    max={100}
                    step={1}
                    className="flex-1"
                />
                <Button 
                    variant={okr.progress === 100 ? "outline" : "default"}
                    size="sm"
                    onClick={handleMarkAsDone}
                    className="bg-accent hover:bg-accent/90 text-accent-foreground h-6 text-xs px-2"
                >
                    <Check className="mr-1 h-3 w-3" />
                    {okr.progress === 100 ? 'Reset' : 'Done'}
                </Button>
             </div>
            <Accordion type="single" collapsible className="w-full">
              <AccordionItem value="item-1" className="border-b-0">
                <AccordionTrigger className="py-0 hover:no-underline text-xs">
                    <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                        <Notebook className="h-3 w-3" />
                        Notes
                    </div>
                </AccordionTrigger>
                <AccordionContent>
                    <div className="space-y-2">
                        <Textarea
                            placeholder="Add your notes here..."
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                            className="min-h-[60px] bg-background text-sm"
                        />
                        <div className="flex justify-end">
                            <Button size="sm" onClick={handleSaveNotes} className="bg-accent hover:bg-accent/90 text-accent-foreground h-7">Save Notes</Button>
                        </div>
                    </div>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </CardContent>
        )}
      
      {displayedChildren.length > 0 && (
        <div
          className={cn(
            "mt-2 space-y-2 relative before:absolute before:left-3 before:top-0 before:h-full before:w-px before:bg-border",
            level > 0 && "pl-0"
          )}
        >
          {displayedChildren.map(child => (
            <OkrCard
              key={child.id}
              okr={child}
              allOkrs={allOkrs}
              level={level + 1}
              onAddOrUpdate={onAddOrUpdate}
            />
          ))}
        </div>
      )}
      
      {canCollapse && (
          <div className="p-3 pt-1">
              <Button 
                variant="ghost" 
                className="w-full text-xs h-7"
                onClick={() => setExpanded(!isExpanded)}
              >
                <ChevronDown className={cn("mr-2 h-4 w-4 transition-transform", isExpanded && "rotate-180")} />
                {isExpanded ? 'Show fewer' : `Show ${children.length - KEY_RESULT_DISPLAY_LIMIT} more key results`}
              </Button>
          </div>
      )}

      {isObjective && (
        <div className="p-3 pt-2">
          <Button 
              variant="outline" 
              className="w-full border-dashed h-8"
              onClick={() => onAddOrUpdate({ parentId: okr.id })}
          >
              <Plus className="mr-2 h-4 w-4" />
              Add Key Result
          </Button>
        </div>
      )}
      </Card>
    </div>
    {isObjective && isSuggestionsOpen && (
        <AiSuggestionsDialog
            isOpen={isSuggestionsOpen}
            setOpen={setSuggestionsOpen}
            objective={okr}
            onAddKR={handleAddKRFromSuggestion}
            suggestAction={async (objective: OkrItem) => {
                const result = await suggestKeyResultsAction(objective.title);
                return result.keyResults;
            }}
        />
    )}
    </>
  );
}
