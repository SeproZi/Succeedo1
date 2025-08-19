
'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { OkrItem, OkrPillar, OkrPriority } from '@/lib/types';
import { Target, MoreVertical, Sparkles, Trash2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';

type OkrGridProps = {
  objectives: OkrItem[];
  onGridItemClick: (id: string) => void;
  onEdit: (okr: OkrItem) => void;
  onDelete: (id: string) => void;
  onSuggest: (okr: OkrItem) => void;
};

const pillars: OkrPillar[] = ['People', 'Product', 'Tech'];

export function OkrGrid({ objectives, onGridItemClick, onEdit, onDelete, onSuggest }: OkrGridProps) {
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
              <GridItem 
                key={obj.id} 
                item={obj} 
                onClick={onGridItemClick} 
                onEdit={onEdit}
                onDelete={onDelete}
                onSuggest={onSuggest}
              />
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
  onClick,
  onEdit,
  onDelete,
  onSuggest,
}: { 
  item: OkrItem; 
  onClick: (id: string) => void;
  onEdit: (okr: OkrItem) => void;
  onDelete: (id: string) => void;
  onSuggest: (okr: OkrItem) => void;
}) {
  const Icon = Target;

  return (
    <Card
      className={cn(
        "group/grid-item cursor-pointer hover:shadow-lg transition-all duration-200 hover:-translate-y-1 relative",
        item.priority && priorityStyles[item.priority]
      )}
      onClick={() => onClick(item.id)}
    >
      <CardContent className="p-4">
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
                <DropdownMenuItem onClick={() => onSuggest(item)}>
                    <Sparkles className="mr-2 h-4 w-4" />
                    Suggest KRs
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onDelete(item.id)} className="text-destructive">
                    <Trash2 className="mr-2 h-4 w-4" />
                    Delete
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
       </div>
    </Card>
  );
}
