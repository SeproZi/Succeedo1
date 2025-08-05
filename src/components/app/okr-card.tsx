'use client';

import { useState } from 'react';
import {
  Target,
  CheckCircle2,
  MoreVertical,
  Plus,
  Trash2,
  Lightbulb,
  Notebook,
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
import { Slider } from '@/components/ui/slider';
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

type OkrCardProps = {
  okr: OkrItem;
  allOkrs: OkrItem[];
  level: number;
  onUpdateProgress: (id: string, progress: number) => void;
  onAddOrUpdate: (data: Partial<OkrItem> | { parentId: string | null }) => void;
  onDelete: (id: string) => void;
  onSuggestKRs: () => void;
  onUpdateNotes: (id: string, notes: string) => void;
};

export function OkrCard({
  okr,
  allOkrs,
  level,
  onUpdateProgress,
  onAddOrUpdate,
  onDelete,
  onSuggestKRs,
  onUpdateNotes,
}: OkrCardProps) {
  const isObjective = okr.type === 'objective';
  const children = allOkrs.filter(item => item.parentId === okr.id);
  const [notes, setNotes] = useState(okr.notes ?? '');
  const { toast } = useToast();

  const handleSaveNotes = () => {
    onUpdateNotes(okr.id, notes);
    toast({
        title: "Notes Saved",
        description: "Your notes have been successfully saved.",
    });
  };

  const icon = isObjective ? (
    <Target className="h-6 w-6 text-primary" />
  ) : (
    <CheckCircle2 className="h-6 w-6 text-green-500" />
  );

  const priorityStyles = {
    P1: 'border-l-4 border-destructive',
    P2: 'border-l-4 border-yellow-500',
    P3: '',
  };

  return (
    <div style={{ marginLeft: level > 0 ? `${level * 1.5}rem` : '0' }}>
      <Card className={cn(
        "overflow-hidden shadow-md hover:shadow-xl transition-shadow duration-300",
        isObjective && okr.priority && priorityStyles[okr.priority]
      )}>
        <CardHeader className="flex flex-row items-center justify-between p-4 bg-card">
          <div className="flex items-center gap-3 flex-1 min-w-0">
            {icon}
            <span className="font-headline font-semibold text-lg truncate text-card-foreground">
              {okr.title}
            </span>
          </div>
          <div className="flex items-center gap-4 ml-4">
            <div className="w-32 hidden sm:block">
              <Progress value={okr.progress} className="h-3" />
            </div>
            <span className="font-semibold text-primary w-12 text-right">
              {okr.progress}%
            </span>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <MoreVertical className="h-5 w-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {isObjective && (
                  <>
                    <DropdownMenuItem onClick={() => onAddOrUpdate({ parentId: okr.id })}>
                      <Plus className="mr-2 h-4 w-4" />
                      <span>Add Item</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={onSuggestKRs}>
                      <Lightbulb className="mr-2 h-4 w-4" />
                      <span>Suggest KRs with AI</span>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                  </>
                )}
                <DropdownMenuItem onClick={() => onAddOrUpdate(okr)}>
                  Edit
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => onDelete(okr.id)}
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
          <CardContent className="p-4 pt-0">
            <div className="flex items-center gap-4">
              <span className="text-sm text-muted-foreground">Progress:</span>
              <Slider
                value={[okr.progress]}
                onValueChange={([value]) => onUpdateProgress(okr.id, value)}
                max={100}
                step={1}
              />
            </div>
            <Accordion type="single" collapsible className="w-full mt-2">
              <AccordionItem value="item-1" className="border-t pt-2">
                <AccordionTrigger>
                    <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                        <Notebook className="h-4 w-4" />
                        Notes
                    </div>
                </AccordionTrigger>
                <AccordionContent>
                    <div className="space-y-2 pt-2">
                        <Textarea
                            placeholder="Add your notes here..."
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                            className="min-h-[100px]"
                        />
                        <div className="flex justify-end">
                            <Button size="sm" onClick={handleSaveNotes}>Save Notes</Button>
                        </div>
                    </div>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </CardContent>
        )}
      </Card>
      {children.length > 0 && (
        <div
          className={cn(
            "mt-4 space-y-4 relative before:absolute before:left-3 before:top-0 before:h-full before:w-px before:bg-border",
            level > 0 && "pl-0"
          )}
        >
          {children.map(child => (
            <OkrCard
              key={child.id}
              okr={child}
              allOkrs={allOkrs}
              level={level + 1}
              onUpdateProgress={onUpdateProgress}
              onAddOrUpdate={onAddOrUpdate}
              onDelete={onDelete}
              onSuggestKRs={onSuggestKRs}
              onUpdateNotes={onUpdateNotes}
            />
          ))}
        </div>
      )}
    </div>
  );
}
