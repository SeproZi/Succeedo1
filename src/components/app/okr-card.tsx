
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
  Link2,
  Users,
  Building,
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
import useOkrStore, { calculateProgress } from '@/hooks/use-okr-store';
import { suggestKeyResultsAction } from '@/lib/actions';
import Link from 'next/link';

type OkrCardProps = {
  okr: OkrItem;
  allOkrs: OkrItem[];
  allStoreOkrs: OkrItem[];
  level: number;
  onAddOrUpdate: (data: Partial<OkrItem> | { parentId: string | null }) => void;
  onCardClick?: (id: string) => void;
};

const KEY_RESULT_DISPLAY_LIMIT = 2;

export function OkrCard({
  okr,
  allOkrs,
  allStoreOkrs,
  level,
  onAddOrUpdate,
  onCardClick,
}: OkrCardProps) {
  const { deleteOkr, updateOkrNotes, updateOkrProgress, addOkr, data } = useOkrStore();
  const isObjective = okr.type === 'objective';
  const children = allOkrs.filter(item => item.parentId === okr.id);
  const linkedChildren = allStoreOkrs.filter(item => item.linkedDepartmentOkrId === okr.id);
  const [notes, setNotes] = useState(okr.notes ?? '');
  const [isKrExpanded, setKrExpanded] = useState(false);
  const [isLinkedExpanded, setLinkedExpanded] = useState(false);
  const { toast } = useToast();
  
  const canCollapseKr = isObjective && children.length > KEY_RESULT_DISPLAY_LIMIT;
  const displayedKrChildren = canCollapseKr && !isKrExpanded ? children.slice(0, KEY_RESULT_DISPLAY_LIMIT) : children;
  
  const canCollapseLinked = isObjective && linkedChildren.length > 0;
  const displayedLinkedChildren = canCollapseLinked && !isLinkedExpanded ? linkedChildren.slice(0, KEY_RESULT_DISPLAY_LIMIT) : linkedChildren;

  const parentDepartmentOkr = allStoreOkrs.find(o => o.id === okr.linkedDepartmentOkrId);
  const parentDepartment = parentDepartmentOkr?.owner.type === 'department' 
    ? data.departments.find(d => d.id === (parentDepartmentOkr.owner as any).id)
    : null;

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
  };
  
  const getTeamName = (teamId: string) => {
    return data.teams.find(t => t.id === teamId)?.title || 'Team';
  }

  const icon = isObjective ? (
    <Target className="h-4 w-4 text-primary" />
  ) : (
    <CheckCircle2 className="h-4 w-4 text-green-500" />
  );
  
  return (
    <>
    <div style={{ marginLeft: level > 0 ? `${level * 0.5}rem` : '0' }}>
      <Card 
        className={cn(
            "overflow-hidden shadow-sm transition-all duration-300",
            onCardClick && isObjective && "cursor-pointer hover:shadow-lg hover:-translate-y-1"
        )}
        onClick={isObjective && onCardClick ? () => onCardClick(okr.id) : undefined}
      >
        <CardHeader className="flex flex-row items-center justify-between p-2 bg-transparent">
          <div className="flex items-center gap-1.5 flex-1 min-w-0">
            {icon}
            <span className="font-semibold text-sm truncate text-card-foreground">
              {okr.title}
            </span>
          </div>
          <div className="flex items-center gap-2 ml-2">
             {okr.type === 'keyResult' && (
                <div className="w-24 hidden sm:flex items-center gap-2">
                    <Progress value={okr.progress} className="h-1.5 flex-1" />
                    <span className="font-semibold text-primary w-9 text-right text-xs">
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
                <Button variant="ghost" size="icon" className="h-6 w-6">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => onAddOrUpdate(okr)}>
                  Edit
                </DropdownMenuItem>
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

        {parentDepartmentOkr && parentDepartment && (
          <div className="px-2 pb-2">
            <Link href={`/department/${parentDepartment.id}?highlight=${parentDepartmentOkr.id}`} className="block">
              <Card className="p-2 hover:bg-secondary transition-colors">
                  <div className="flex items-center gap-2">
                    <Link2 className='h-3 w-3 text-muted-foreground' />
                    <span className='text-xs font-semibold'>Department OKR link:</span>
                    <span className='text-xs text-muted-foreground truncate' title={parentDepartmentOkr.title}>
                      {parentDepartment.title}: {parentDepartmentOkr.title}
                    </span>
                  </div>
              </Card>
            </Link>
          </div>
        )}

        {!isObjective && (
          <CardContent className="p-2 pt-0 space-y-2">
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
                <AccordionTrigger className="py-0 hover:no-underline text-xs h-5">
                    <div className="flex items-center gap-1 text-xs font-medium text-muted-foreground">
                        <Notebook className="h-3 w-3" />
                        Notes
                    </div>
                </AccordionTrigger>
                <AccordionContent className="pt-2">
                    <div className="space-y-2">
                        <Textarea
                            placeholder="Add your notes here..."
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                            className="min-h-[50px] bg-background text-sm"
                        />
                        <div className="flex justify-end">
                            <Button size="sm" onClick={handleSaveNotes} className="bg-accent hover:bg-accent/90 text-accent-foreground h-6 text-xs">Save Notes</Button>
                        </div>
                    </div>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </CardContent>
        )}
      
      {displayedKrChildren.length > 0 && (
        <div
          className={cn(
            "mt-1 space-y-1 relative before:absolute before:left-2.5 before:top-0 before:h-full before:w-px before:bg-border",
            level > 0 && "pl-0"
          )}
        >
          {displayedKrChildren.map(child => (
            <OkrCard
              key={child.id}
              okr={child}
              allOkrs={allOkrs}
              allStoreOkrs={allStoreOkrs}
              level={level + 1}
              onAddOrUpdate={onAddOrUpdate}
            />
          ))}
        </div>
      )}
      
      {canCollapseKr && (
          <div className="px-2 py-1">
              <Button 
                variant="ghost" 
                className="w-full text-xs h-6"
                onClick={() => setKrExpanded(!isKrExpanded)}
              >
                <ChevronDown className={cn("mr-2 h-3 w-3 transition-transform", isKrExpanded && "rotate-180")} />
                {isKrExpanded ? 'Show fewer' : `Show ${children.length - KEY_RESULT_DISPLAY_LIMIT} more key results`}
              </Button>
          </div>
      )}
      
       {canCollapseLinked && (
        <div className='border-t mt-1'>
            <Accordion type="single" collapsible className="w-full">
                 <AccordionItem value="item-1" className="border-b-0">
                    <AccordionTrigger className="py-1 px-2 hover:no-underline text-xs">
                        <div className="flex items-center gap-1 text-xs font-medium text-muted-foreground">
                            <Link2 className="h-3 w-3" />
                             Linked Team OKRs ({linkedChildren.length})
                        </div>
                    </AccordionTrigger>
                    <AccordionContent className="pt-1 pb-1 space-y-1">
                       {(isLinkedExpanded ? linkedChildren : displayedLinkedChildren).map(child => {
                         if (child.owner.type !== 'team') return null;
                         const teamName = getTeamName(child.owner.id);
                         const progress = calculateProgress(child.id, allStoreOkrs);
                         return (
                            <Link key={child.id} href={`/department/${child.owner.departmentId}/team/${child.owner.id}?highlight=${child.id}`} className="block px-2">
                                <Card className='p-2 hover:bg-secondary'>
                                    <div className="flex items-start gap-2">
                                        <div className="flex-shrink-0 w-8 flex flex-col items-center gap-1">
                                            <Users className='h-3.5 w-3.5 text-muted-foreground' />
                                            <span className="font-semibold text-primary text-xs">
                                                {progress}%
                                            </span>
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className='text-xs text-muted-foreground leading-snug'>
                                              <span className='font-semibold'>{teamName.charAt(0)}: </span>
                                              {child.title}
                                            </p>
                                        </div>
                                    </div>
                                </Card>
                            </Link>
                        )
                       })}
                        {linkedChildren.length > KEY_RESULT_DISPLAY_LIMIT && (
                            <div className="px-2 pt-1">
                                <Button 
                                    variant="ghost" 
                                    className="w-full text-xs h-6"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        setLinkedExpanded(!isLinkedExpanded);
                                    }}
                                >
                                    <ChevronDown className={cn("mr-2 h-3 w-3 transition-transform", isLinkedExpanded && "rotate-180")} />
                                    {isLinkedExpanded ? 'Show fewer' : `Show ${linkedChildren.length - KEY_RESULT_DISPLAY_LIMIT} more linked OKRs`}
                                </Button>
                            </div>
                        )}
                    </AccordionContent>
                 </AccordionItem>
            </Accordion>
        </div>
      )}


      {isObjective && (
        <div className="p-2 pt-1">
          <Button 
              variant="outline" 
              className="w-full border-dashed h-7"
              onClick={() => onAddOrUpdate({ parentId: okr.id })}
          >
              <Plus className="mr-2 h-3 w-3" />
              <span className="text-xs">Add Key Result</span>
          </Button>
        </div>
      )}
      </Card>
    </div>
    </>
  );
}
