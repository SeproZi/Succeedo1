'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { OkrItem, OkrOwner, OkrPillar, OkrPriority } from '@/lib/types';
import { Target, MoreVertical, Sparkles, Trash2, Link2, Users, ChevronRight, Building, GripVertical } from 'lucide-react';
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
import { useState, useMemo, useEffect, useCallback } from 'react';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '../ui/collapsible';
import { Textarea } from '../ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { DragDropContext, Droppable, Draggable, OnDragEndResponder } from '@hello-pangea/dnd';

type OkrGridProps = {
  objectives: OkrItem[];
  allOkrs: OkrItem[];
  onGridItemClick: (id: string) => void;
  onEdit: (okr: OkrItem) => void;
  onDelete: (id: string) => void;
  owner: OkrOwner;
  pillarDescriptions?: Partial<Record<OkrPillar, string>>;
};

const MAX_ITEMS_PER_COLUMN = 5;

function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

export function OkrGrid({ objectives, allOkrs, onGridItemClick, onEdit, onDelete, owner, pillarDescriptions }: OkrGridProps) {
  const [expandedItemId, setExpandedItemId] = useState<string | null>(null);
  const { updatePillarDescription, reorderOkrs } = useOkrStore();
  const [localDescriptions, setLocalDescriptions] = useState(pillarDescriptions || {});
  const debouncedDescriptions = useDebounce(localDescriptions, 500);
  const { toast } = useToast();

  useEffect(() => {
    setLocalDescriptions(pillarDescriptions || {});
  }, [pillarDescriptions]);

  useEffect(() => {
    const saveChanges = async () => {
      for (const pillar in debouncedDescriptions) {
          if (debouncedDescriptions[pillar as OkrPillar] !== pillarDescriptions?.[pillar as OkrPillar]) {
              await updatePillarDescription(owner, pillar as OkrPillar, debouncedDescriptions[pillar as OkrPillar] || '');
              toast({ title: "Description Saved", description: `${pillar} description has been updated.` });
          }
      }
    };
    saveChanges();
  }, [debouncedDescriptions, owner, pillarDescriptions, updatePillarDescription, toast]);

  const handleDescriptionChange = useCallback((pillar: OkrPillar, value: string) => {
    setLocalDescriptions(prev => ({ ...prev, [pillar]: value }));
  }, []);
  
  const objectivesByPillar = useMemo(() => {
    const grouped: Record<OkrPillar, OkrItem[]> = { People: [], Product: [], Tech: [] };
    objectives.forEach(obj => {
        if(obj.pillar) {
            grouped[obj.pillar].push(obj);
        }
    });
    // Sort objectives within each pillar by their 'order' property
    for(const pillar in grouped) {
        grouped[pillar as OkrPillar].sort((a, b) => a.order - b.order);
    }
    return grouped;
  }, [objectives]);

  const onDragEnd: OnDragEndResponder = (result) => {
    const { source, destination, draggableId } = result;

    if (!destination) {
      return;
    }

    const sourcePillar = source.droppableId.split('-')[0] as OkrPillar;
    const destPillar = destination.droppableId.split('-')[0] as OkrPillar;
    
    if (sourcePillar !== destPillar) {
        return; // Prevent dragging between different pillars
    }

    const pillarObjectives = Array.from(objectivesByPillar[sourcePillar]);
    const [movedObjective] = pillarObjectives.splice(source.index, 1);
    pillarObjectives.splice(destination.index, 0, movedObjective);
    
    const orderedIds = pillarObjectives.map(obj => obj.id);
    reorderOkrs(sourcePillar, orderedIds);
  };
  
  const gridColumns = useMemo(() => {
    const columns: { pillar: OkrPillar; objectives: OkrItem[] }[] = [];
    const pillarOrder: OkrPillar[] = ['People', 'Product', 'Tech'];

    pillarOrder.forEach(pillar => {
      const pillarObjectives = objectivesByPillar[pillar];
      if (pillarObjectives.length > 0) {
        for (let i = 0; i < pillarObjectives.length; i += MAX_ITEMS_PER_COLUMN) {
          columns.push({
            pillar: pillar,
            objectives: pillarObjectives.slice(i, i + MAX_ITEMS_PER_COLUMN),
          });
        }
      } else {
        columns.push({ pillar, objectives: [] });
      }
    });

    return columns.filter(c => c.objectives.length > 0 || (localDescriptions[c.pillar] && localDescriptions[c.pillar]?.trim() !== ''));

  }, [objectivesByPillar, localDescriptions]);
  
  const totalColumns = gridColumns.length > 3 ? gridColumns.length : 3;

  return (
    <DragDropContext onDragEnd={onDragEnd}>
        <div 
          className="grid gap-6 items-start"
          style={{ gridTemplateColumns: `repeat(${totalColumns}, minmax(0, 1fr))` }}
        >
          {gridColumns.map((col, index) => (
            <div key={`${col.pillar}-${index}`} className="space-y-4">
                <div className="bg-card/50 border border-border rounded-lg shadow-sm p-2">
                    <h3 className="text-center text-sm font-bold tracking-wider uppercase text-primary/80">
                      {col.pillar}
                    </h3>
                </div>
                <Textarea
                    placeholder="add text here"
                    value={localDescriptions[col.pillar] || ''}
                    onChange={(e) => handleDescriptionChange(col.pillar, e.target.value)}
                    className="text-sm min-h-[60px]"
                />
                <Droppable droppableId={`${col.pillar}-${index}`}>
                    {(provided) => (
                        <div {...provided.droppableProps} ref={provided.innerRef} className="space-y-4">
                           {col.objectives.map((obj, objIndex) => (
                              <Draggable key={obj.id} draggableId={obj.id} index={obj.order}>
                                {(provided) => (
                                    <div
                                        ref={provided.innerRef}
                                        {...provided.draggableProps}
                                        {...provided.dragHandleProps}
                                    >
                                        <Collapsible key={obj.id} id={`grid-item-${obj.id}`} open={expandedItemId === obj.id} onOpenChange={(isOpen) => setExpandedItemId(isOpen ? obj.id : null)}>
                                          <GridItem 
                                            item={obj} 
                                            allOkrs={allOkrs}
                                            onClick={onGridItemClick} 
                                            onEdit={onEdit}
                                            onDelete={onDelete}
                                          />
                                          <CollapsibleContent>
                                            <LinkedOkrList objectiveId={obj.id} allOkrs={allOkrs} />
                                          </CollapsibleContent>
                                        </Collapsible>
                                    </div>
                                )}
                              </Draggable>
                           ))}
                           {provided.placeholder}
                        </div>
                    )}
                </Droppable>
            </div>
          ))}
           {Array.from({ length: Math.max(0, 3 - gridColumns.length) }).map((_, index) => (
            <div key={`placeholder-${index}`} />
          ))}
        </div>
    </DragDropContext>
  );
}

const priorityStyles: Record<OkrPriority, string> = {
  P1: 'bg-purple-700/10 border-purple-700/20',
  P2: 'bg-cyan-500/10 border-cyan-500/20',
  P3: 'bg-card border-border',
};

function GridItem({ 
  item, 
  allOkrs,
  onClick,
  onEdit,
  onDelete,
}: { 
  item: OkrItem; 
  allOkrs: OkrItem[];
  onClick: (id: string) => void;
  onEdit: (okr: OkrItem) => void;
  onDelete: (id: string) => void;
}) {
  const Icon = Target;
  const { data } = useOkrStore();
  
  const linkedChildren = allOkrs.filter(okr => okr.linkedDepartmentOkrId === item.id);
  const parentDepartmentOkr = allOkrs.find(o => o.id === item.linkedDepartmentOkrId);
  const parentDepartment = parentDepartmentOkr?.owner.type === 'department' 
    ? data.departments.find(d => d.id === (parentDepartmentOkr.owner as any).id)
    : null;


  return (
    <>
    <Card
      className={cn(
        "group/grid-item cursor-pointer hover:shadow-lg transition-all duration-200 hover:-translate-y-1 relative",
        item.priority && priorityStyles[item.priority]
      )}
      onClick={() => onClick(item.id)}
    >
      <CardContent className="p-3 pb-2 space-y-2">
        <div className="flex items-start gap-2.5">
          <Icon className="h-4 w-4 mt-0.5 text-primary" />
          <div className="flex-1">
            <p className="font-semibold text-card-foreground leading-tight pr-6 text-sm">{item.title}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Progress value={item.progress} className="h-1.5" />
          <span className="text-xs font-mono text-muted-foreground">{item.progress}%</span>
        </div>
      </CardContent>
      {parentDepartmentOkr && parentDepartment && (
        <div className="px-3 pb-2">
          <Link href={`/department/${parentDepartment.id}?highlight=${parentDepartmentOkr.id}`} onClick={(e) => e.stopPropagation()}>
            <Button 
              variant="ghost" 
              size="sm" 
              className="h-auto p-1 text-xs text-muted-foreground hover:text-foreground w-full justify-start -ml-1"
            >
                <Building className="mr-1 h-3 w-3"/>
                 <span className="truncate">Parent: {parentDepartment.title}</span>
            </Button>
          </Link>
        </div>
      )}
      {linkedChildren.length > 0 && (
        <div className="px-3 pb-2">
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
       <div className="absolute top-1/2 left-0 -translate-y-1/2 -translate-x-full p-1 opacity-0 group-hover/grid-item:opacity-50 transition-opacity cursor-grab">
          <GripVertical className="h-5 w-5 text-muted-foreground" />
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
                    <Link key={child.id} href={`/department/${child.owner.departmentId}/team/${child.owner.id}?highlight=${child.id}`} className="block">
                        <Card className='p-2 hover:bg-secondary transition-colors'>
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
        </div>
    );
}
