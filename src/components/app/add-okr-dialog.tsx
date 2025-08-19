
'use client';

import { useEffect, useState, useMemo } from 'react';
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
  SelectGroup,
  SelectLabel,
} from '@/components/ui/select';
import { Plus } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import useOkrStore from '@/hooks/use-okr-store';
import { Separator } from '../ui/separator';
import { OkrItem, OkrOwner, OkrPillar } from '@/lib/types';

const formSchema = z.object({
  id: z.string().optional(),
  title: z.string().min(3, 'Title must be at least 3 characters long.'),
  type: z.enum(['objective', 'keyResult']),
  parentId: z.string().nullable(),
  pillar: z.enum(['People', 'Product', 'Tech']).optional(),
  priority: z.enum(['P1', 'P2', 'P3'], { required_error: 'A priority is required.' }),
  notes: z.string().optional(),
  year: z.number(),
  period: z.enum(['P1', 'P2', 'P3']),
  linkedDepartmentOkrId: z.string().nullable().optional(),
}).superRefine((data, ctx) => {
    if (data.type === 'objective' && !data.pillar) {
        ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: ['pillar'],
            message: 'A pillar is required for an objective.',
        });
    }
});


type AddOkrDialogProps = {
  isOpen: boolean;
  setOpen: (isOpen: boolean) => void;
  okrData: Partial<OkrItem> | { parentId: string | null, owner: OkrOwner };
  owner: OkrOwner;
};

export function AddOkrDialog({
  isOpen,
  setOpen,
  okrData,
  owner,
}: AddOkrDialogProps) {
  const isEditing = okrData && 'id' in okrData;
  const { toast } = useToast();
  const { addOkr, updateOkr, currentYear, currentPeriod, availableYears, addYear, data } = useOkrStore();
  const isTeamObjective = owner.type === 'team' && (!('type' in okrData) || okrData.type === 'objective');

  const objectives = useOkrStore(state => 
    state.data.okrs.filter(okr => 
        okr.type === 'objective' && 
        JSON.stringify(okr.owner) === JSON.stringify(owner) &&
        okr.year === currentYear &&
        okr.period === currentPeriod
    )
  );

  const departmentObjectivesByPillar = useMemo(() => {
    if (owner.type !== 'team') return {};
    
    // Fetch all department-level objectives for the current timeline.
    const departmentObjectives = data.okrs.filter(okr =>
        okr.type === 'objective' &&
        okr.owner.type === 'department' &&
        okr.year === currentYear &&
        okr.period === currentPeriod
    ).sort((a, b) => a.title.localeCompare(b.title));

    // Group them by pillar.
    return departmentObjectives.reduce((acc, okr) => {
        const pillar = okr.pillar || 'Other';
        if (!acc[pillar]) {
            acc[pillar] = [];
        }
        acc[pillar].push(okr);
        return acc;
    }, {} as Record<OkrPillar | 'Other', OkrItem[]>);
  }, [data.okrs, owner.type, currentYear, currentPeriod]);

  const sortedPillars: OkrPillar[] = useMemo(() => {
    const desiredOrder: OkrPillar[] = ['People', 'Product', 'Tech'];
    return Object.keys(departmentObjectivesByPillar)
        .filter(pillar => desiredOrder.includes(pillar as OkrPillar))
        .sort((a, b) => desiredOrder.indexOf(a as OkrPillar) - desiredOrder.indexOf(b as OkrPillar)) as OkrPillar[];
  }, [departmentObjectivesByPillar]);


  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      id: (isEditing && okrData.id) || '',
      title: (isEditing && okrData.title) || '',
      type: (isEditing && okrData.type) || (okrData?.parentId ? 'keyResult' : 'objective'),
      parentId: okrData?.parentId || null,
      pillar: (isEditing && okrData.pillar) || undefined,
      priority: (isEditing && okrData.priority) || 'P3', // Default to P3 Normal
      notes: (isEditing && okrData.notes) || '',
      year: (isEditing && okrData.year) || currentYear,
      period: (isEditing && okrData.period) || currentPeriod,
      linkedDepartmentOkrId: (isEditing && okrData.linkedDepartmentOkrId) || null,
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
        linkedDepartmentOkrId: (okrData && 'linkedDepartmentOkrId' in okrData && okrData.linkedDepartmentOkrId) || null,
      });
    }
  }, [okrData, form, currentYear, currentPeriod]);

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    const dataToSend = { ...values };
    
    if (dataToSend.type === 'objective') {
      dataToSend.parentId = null;
    } else {
      delete dataToSend.pillar;
      delete dataToSend.linkedDepartmentOkrId;
    }
    
    const { id, ...okrData } = dataToSend;

    if (isEditing && id) {
        await updateOkr(id, { ...okrData, owner });
    } else {
        await addOkr({ ...okrData, owner });
    }
    
    setOpen(false);
  };
  
  const type = form.watch('type');

  const handleAddYear = () => {
    const newYearString = prompt('Enter the year to add:');
    if (newYearString) {
        const newYear = parseInt(newYearString, 10);
        if (!isNaN(newYear) && newYear > 2000) {
            addYear(newYear);
            toast({ title: "Year Added", description: `Year ${newYear} has been added.`});
        } else {
            toast({ title: "Invalid Year", description: "Please enter a valid year.", variant: "destructive"});
        }
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
                            <Button variant="outline" size="sm" className="w-full" type="button" onClick={handleAddYear}>
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
                  <Select 
                    onValueChange={field.onChange} 
                    defaultValue={field.value}
                    disabled={true}
                  >
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
            
            {isTeamObjective && type === 'objective' && (
              <FormField
                control={form.control}
                name="linkedDepartmentOkrId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Department OKR Link (Optional)</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value ?? ''}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Link to a department objective" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="null">None</SelectItem>
                        {sortedPillars.map(pillar => (
                            <SelectGroup key={pillar}>
                                <SelectLabel>{pillar}</SelectLabel>
                                {departmentObjectivesByPillar[pillar]?.map(obj => (
                                    <SelectItem key={obj.id} value={obj.id}>
                                        {obj.title}
                                    </SelectItem>
                                ))}
                            </SelectGroup>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}


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
