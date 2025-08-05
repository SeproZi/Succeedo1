'use client';

import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Sparkles, Loader2, Plus } from 'lucide-react';
import type { OkrItem, OkrOwner, BaseItem, TimelinePeriod } from '@/lib/types';
import { suggestKeyResultsAction } from '@/lib/actions';
import { useToast } from '@/hooks/use-toast';
import { useOkrStore } from '@/hooks/use-okr-store';
import { Separator } from '../ui/separator';

const formSchema = z.object({
  id: z.string().optional(),
  title: z.string().min(3, 'Title must be at least 3 characters long.'),
  type: z.enum(['objective', 'keyResult']),
  parentId: z.string().nullable(),
  pillar: z.enum(['People', 'Product', 'Tech']).optional(),
  priority: z.enum(['P1', 'P2', 'P3']).optional(),
  notes: z.string().optional(),
  year: z.number(),
  period: z.enum(['P1', 'P2', 'P3']),
});

type AddOkrDialogProps = {
  isOpen: boolean;
  setOpen: (isOpen: boolean) => void;
  okrData: Partial<OkrItem> | { parentId: string | null, owner: OkrOwner };
  owner: OkrOwner;
};

const availableYears = [
    new Date().getFullYear() -1,
    new Date().getFullYear(),
    new Date().getFullYear() + 1
];

export function AddOkrDialog({
  isOpen,
  setOpen,
  okrData,
  owner,
}: AddOkrDialogProps) {
  const isEditing = okrData && 'id' in okrData;
  const { toast } = useToast();
  const [isSuggesting, setIsSuggesting] = useState(false);
  const { addOkr, updateOkr, currentYear, currentPeriod } = useOkrStore();

  const objectives = useOkrStore(state => 
    state.data.okrs.filter(okr => 
        okr.type === 'objective' && 
        JSON.stringify(okr.owner) === JSON.stringify(owner) &&
        okr.year === currentYear &&
        okr.period === currentPeriod
    )
  );

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      id: (isEditing && okrData.id) || '',
      title: (isEditing && okrData.title) || '',
      type: (isEditing && okrData.type) || (okrData?.parentId ? 'keyResult' : 'objective'),
      parentId: okrData?.parentId || null,
      pillar: (isEditing && okrData.pillar) || undefined,
      priority: (isEditing && okrData.priority) || 'P3',
      notes: (isEditing && okrData.notes) || '',
      year: (isEditing && okrData.year) || currentYear,
      period: (isEditing && okrData.period) || currentPeriod,
    },
  });

  useEffect(() => {
    if (okrData) {
      form.reset({
        id: (okrData && 'id' in okrData && okrData.id) || '',
        title: (okrData && 'title' in okrData && okrData.title) || '',
        type: (okrData && 'type' in okrData && okrData.type) || (okrData?.parentId ? 'keyResult' : 'objective'),
        parentId: okrData?.parentId || null,
        pillar: (okrData && 'pillar' in okrData && okrData.pillar) || undefined,
        priority: (okrData && 'priority' in okrData && okrData.priority) || 'P3',
        notes: (okrData && 'notes' in okrData && okrData.notes) || '',
        year: (okrData && 'year' in okrData && okrData.year) || currentYear,
        period: (okrData && 'period' in okrData && okrData.period) || currentPeriod,
      });
    }
  }, [okrData, form, currentYear, currentPeriod]);

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    if (values.type === 'objective') {
      values.parentId = null;
    }
    
    if (isEditing && values.id) {
        updateOkr(values.id, { ...values, owner });
    } else {
        addOkr({ ...values, owner });
    }
    
    setOpen(false);
  };
  
  const type = form.watch('type');
  const parentId = form.watch('parentId');

  const handleSuggestKRs = async () => {
    const objectiveId = parentId;
    if (!objectiveId) {
        toast({ title: "Error", description: "Please select a parent objective first.", variant: "destructive" });
        return;
    }
    const objective = objectives.find(o => o.id === objectiveId);
    if (!objective) {
        toast({ title: "Error", description: "Parent objective not found.", variant: "destructive" });
        return;
    }
    setIsSuggesting(true);
    try {
        const result = await suggestKeyResultsAction(objective.title);
        const suggestions = result.keyResults;
        if (suggestions.length > 0) {
            form.setValue('title', suggestions[0]);
            toast({ title: "Suggestion applied!", description: "The first AI suggestion has been applied to the title." });
        } else {
            toast({ title: "No suggestions", description: "The AI couldn't find any suggestions." });
        }
    } catch (error) {
        console.error(error);
        toast({ title: "Error", description: "Failed to get AI suggestions.", variant: "destructive" });
    } finally {
        setIsSuggesting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="font-headline">
            {isEditing ? 'Edit Item' : 'Add New Item'}
          </DialogTitle>
          <DialogDescription>
            {isEditing
              ? 'Update the details of your objective or key result.'
              : 'Add a new objective or key result to track.'}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4 max-h-[70vh] overflow-y-auto pr-2">
            <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="year"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Year</FormLabel>
                      <Select onValueChange={(v) => field.onChange(Number(v))} defaultValue={String(field.value)}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a year" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {availableYears.map(y => (
                            <SelectItem key={y} value={String(y)}>{y}</SelectItem>
                          ))}
                          <Separator className="my-1" />
                           <div className="p-2">
                            <Button variant="outline" size="sm" className="w-full" disabled>
                                <Plus className="mr-2 h-4 w-4" />
                                Add Year
                            </Button>
                           </div>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="period"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Period</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a period" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="P1">Period 1</SelectItem>
                          <SelectItem value="P2">Period 2</SelectItem>
                          <SelectItem value="P3">Period 3</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
            </div>
            <FormField
              control={form.control}
              name="type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Type</FormLabel>
                  <Select onValueChange={(value) => {
                      field.onChange(value);
                      if (value === 'objective') form.setValue('parentId', null);
                  }} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select item type" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="objective">Objective</SelectItem>
                      <SelectItem value="keyResult">Key Result</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Title</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., Increase user engagement" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {type === 'keyResult' && (
                <>
                  <FormField
                    control={form.control}
                    name="parentId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Parent Objective</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value ?? ''}>
                          <FormControl>
                            <SelectTrigger disabled={!!okrData?.parentId}>
                              <SelectValue placeholder="Select a parent objective" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {objectives.map(obj => (
                              <SelectItem key={obj.id} value={obj.id}>
                                {obj.title}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <Button type="button" variant="outline" size="sm" onClick={handleSuggestKRs} disabled={isSuggesting || !parentId}>
                    {isSuggesting ? (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                        <Sparkles className="mr-2 h-4 w-4" />
                    )}
                    Suggest with AI
                  </Button>
                </>
            )}
            
            {type === 'objective' && (
                <FormField
                  control={form.control}
                  name="pillar"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Pillar</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a pillar" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="People">People</SelectItem>
                          <SelectItem value="Product">Product</SelectItem>
                          <SelectItem value="Tech">Tech</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
            )}
            <FormField
              control={form.control}
              name="priority"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Priority</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a priority" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="P1">P1: Critical</SelectItem>
                      <SelectItem value="P2">P2: High</SelectItem>
                      <SelectItem value="P3">P3: Normal</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <DialogFooter>
              <Button type="button" variant="ghost" onClick={() => setOpen(false)}>Cancel</Button>
              <Button type="submit" className="bg-accent hover:bg-accent/90 text-accent-foreground">Save</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

    