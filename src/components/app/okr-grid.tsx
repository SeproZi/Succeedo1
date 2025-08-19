
'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { OkrItem, OkrPillar, OkrPriority } from '@/lib/types';
import { Target, MoreVertical, Sparkles, Trash2, Link2, Users, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuSubContent,
  DropdownMenuSeparator
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import useOkrStore, { calculateProgress } from '@/hooks/use-okr-store';
import Link from 'next/link';
import { useState } from 'react';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '../ui/collapsible';

type OkrGridProps = {
  objectives: OkrItem[];
  allOkrs: OkrItem[];
  onGridItemClick: (id: string) => void;
  onEdit: (okr: OkrItem) => void;
  onDelete: (id: string) => void;
  onSuggest: (okr: OkrItem) => void;
};

const pillars: OkrPillar[] = ['People', 'Product', 'Tech'];

export function OkrGrid({ objectives, allOkrs, onGridItemClick, onEdit, onDelete, onSuggest }: OkrGridProps) {
  const [expandedItemId, setExpandedItemId] = useState<string | null>(null);

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
      {pillars.map(pillar => (
        <div key={pillar} className="space-y-4">
          <div className="bg-card/50 border border-border rounded-lg shadow-sm p-3">
            <h3 className="text-center text-base font-bold tracking-wider uppercase text-primary/80">
              {pillar}
            </h3>
          </div>
          {objectives
            .filter(obj => obj && obj.id && obj.pillar === pillar)
            .map(obj => (
              <Collapsible key={obj.id} open={expandedItemId === obj.id} onOpenChange={(isOpen) => setExpandedItemId(isOpen ? obj.id : null)}>
                <GridItem 
                  item={obj} 
                  allOkrs={allOkrs}
                  onClick={onGridItemClick} 
                  onEdit={onEdit}
                  onDelete={onDelete}
                  onSuggest={onSuggest}
                />
                <CollapsibleContent>
                  <LinkedOkrList objectiveId={obj.id} allOkrs={allOkrs} />
                </CollapsibleContent>
              </Collapsible>
            ))}
        </div>
      ))}
    </div>
  );
}

const priorityStyles: Record<OkrPriority, string> = {
  P1: 'bg-red-500/10 border-red-500/20',
  P2: 'bg-amber-500/10 border-amber-500/20',
  P3: 'bg-card border-border',
};

function GridItem({ 
  item, 
  allOkrs,
  onClick,
  onEdit,
  onDelete,
  onSuggest,
}: { 
  item: OkrItem; 
  allOkrs: OkrItem[];
  onClick: (id: string) => void;
  onEdit: (okr: OkrItem) => void;
  onDelete: (id: string) => void;
  onSuggest: (okr: OkrItem) => void;
}) {
  const Icon = Target;
  
  const linkedChildren = allOkrs.filter(okr => okr.linkedDepartmentOkrId === item.id);

  return (
    <>
    <Card
      className={cn(
        "group/grid-item cursor-pointer hover:shadow-lg transition-all duration-200 hover:-translate-y-1 relative",
        item.priority && priorityStyles[item.priority]
      )}
      onClick={() => onClick(item.id)}
    >
      <CardContent className="p-4 pb-2">
        <div className="flex items-start gap-3">
          <Icon className="h-5 w-5 mt-0.5 text-primary" />
          <div className="flex-1">
            <p className="font-semibold text-card-foreground leading-tight pr-6">{item.title}</p>
            <div className="flex items-center gap-2 mt-2">
              <Progress value={item.progress} className="h-1.5" />
              <span className="text-xs font-mono text-muted-foreground">{item.progress}%</span>
            </div>
          </div>
        </div>
      </CardContent>
      {linkedChildren.length > 0 && (
        <div className="px-4 pb-2">
            <CollapsibleTrigger asChild>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="h-auto p-1 text-xs text-muted-foreground hover:text-foreground w-full justify-start -ml-1"
                  onClick={(e) => e.stopPropagation()}
                >
                    <Link2 className="mr-1 h-3 w-3"/>
                    {linkedChildren.length} Linked Team OKR{linkedChildren.length > 1 ? 's' : ''}
                    <ChevronRight className="ml-auto h-4 w-4 transition-transform group-data-[state=open]:rotate-90"/>
                </Button>
            </CollapsibleTrigger>
        </div>
      )}
       <div className="absolute top-2 right-2 opacity-0 group-hover/grid-item:opacity-100 transition-opacity">
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-7 w-7"
                    onClick={(e) => e.stopPropagation()}
                >
                    <MoreVertical className="h-4 w-4" />
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent onClick={(e) => e.stopPropagation()}>
                <DropdownMenuItem onClick={() => onEdit(item)}>Edit</DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => onDelete(item.id)} className="text-destructive">
                    <Trash2 className="mr-2 h-4 w-4" />
                    Delete
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
       </div>
    </Card>
    </>
  );
}

function LinkedOkrList({ objectiveId, allOkrs }: { objectiveId: string, allOkrs: OkrItem[] }) {
    const { data } = useOkrStore();
    const getTeamName = (teamId: string) => data.teams.find(t => t.id === teamId)?.title || 'Team';
    const linkedChildren = allOkrs.filter(okr => okr.linkedDepartmentOkrId === objectiveId);

    if (linkedChildren.length === 0) return null;

    return (
        <div className="ml-4 pl-3 border-l-2 border-border space-y-2 py-2">
            {linkedChildren.map(child => {
                if (child.owner.type !== 'team') return null;
                const teamName = getTeamName(child.owner.id);
                const progress = calculateProgress(child.id, allOkrs);
                return (
                    <Link key={child.id} href={`/department/${child.owner.departmentId}/team/${child.owner.id}`} className="block">
                        <Card className='p-2 hover:bg-secondary transition-colors'>
                            <div className="flex items-center justify-between">
                                <div className='flex items-center gap-2'>
                                    <Users className='h-3 w-3 text-muted-foreground' />
                                    <span className='text-xs font-semibold'>{teamName}: </span>
                                    <span className='text-xs text-muted-foreground truncate' title={child.title}>{child.title}</span>
                                </div>
                                <div className="w-20 flex-shrink-0 flex items-center gap-2">
                                    <Progress value={progress} className="h-1.5 flex-1" />
                                    <span className="font-semibold text-primary w-8 text-right text-xs">
                                        {progress}%
                                    </span>
                                </div>
                            </div>
                        </Card>
                    </Link>
                )
            })}
        </div>
    );
}
