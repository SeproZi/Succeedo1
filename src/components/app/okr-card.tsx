'use client';

import {
  Target,
  CheckCircle2,
  MoreVertical,
  Plus,
  Trash2,
  Lightbulb,
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
import type { OkrItem } from '@/lib/types';
import { cn } from '@/lib/utils';

type OkrCardProps = {
  okr: OkrItem;
  allOkrs: OkrItem[];
  level: number;
  onUpdateProgress: (id: string, progress: number) => void;
  onAddOrUpdate: (data: OkrItem | { parentId: string | null }) => void;
  onDelete: (id: string) => void;
  onSuggestKRs: (objective: OkrItem) => void;
};

export function OkrCard({
  okr,
  allOkrs,
  level,
  onUpdateProgress,
  onAddOrUpdate,
  onDelete,
  onSuggestKRs,
}: OkrCardProps) {
  const isObjective = okr.type === 'objective';
  const children = allOkrs.filter(item => item.parentId === okr.id);

  const icon = isObjective ? (
    <Target className="h-6 w-6 text-primary" />
  ) : (
    <CheckCircle2 className="h-6 w-6 text-green-500" />
  );

  return (
    <div style={{ marginLeft: level > 0 ? `${level * 1.5}rem` : '0' }}>
      <Card className="overflow-hidden shadow-md hover:shadow-xl transition-shadow duration-300">
        <CardHeader className="flex flex-row items-center justify-between p-4 bg-card">
          <div className="flex items-center gap-3 flex-1 min-w-0">
            {icon}
            <span className="font-headline font-semibold text-lg truncate text-card-foreground">
              {okr.title}
            </span>
          </div>
          <div className="flex items-center gap-4 ml-4">
            <div className="w-32 hidden sm:block">
              <Progress value={okr.progress} className="h-3" indicatorClassName={okr.progress > 80 ? 'bg-green-500' : 'bg-accent'} />
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
                    <DropdownMenuItem onClick={() => onSuggestKRs(okr)}>
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
            />
          ))}
        </div>
      )}
    </div>
  );
}
