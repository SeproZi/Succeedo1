'use client';

import { useEffect } from 'react';
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
import type { OkrItem } from '@/lib/types';

const formSchema = z.object({
  id: z.string().optional(),
  title: z.string().min(3, 'Title must be at least 3 characters long.'),
  type: z.enum(['objective', 'keyResult']),
  parentId: z.string().nullable(),
  pillar: z.enum(['People', 'Product', 'Tech']).optional(),
  priority: z.enum(['P1', 'P2', 'P3']).optional(),
});

type AddOkrDialogProps = {
  isOpen: boolean;
  setOpen: (isOpen: boolean) => void;
  okrData: Partial<OkrItem> | { parentId: string | null } | null;
  onSave: (data: z.infer<typeof formSchema>) => void;
  objectives: OkrItem[];
};

export function AddOkrDialog({
  isOpen,
  setOpen,
  okrData,
  onSave,
  objectives,
}: AddOkrDialogProps) {
  const isEditing = okrData && 'id' in okrData;
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      id: (isEditing && okrData.id) || '',
      title: (isEditing && okrData.title) || '',
      type: (isEditing && okrData.type) || (okrData?.parentId ? 'keyResult' : 'objective'),
      parentId: okrData?.parentId || null,
      pillar: (isEditing && okrData.pillar) || undefined,
      priority: (isEditing && okrData.priority) || 'P3',
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
      });
    }
  }, [okrData, form]);

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    if (values.type === 'keyResult') {
      values.pillar = undefined;
      values.priority = undefined;
    } else if (values.type === 'objective') {
      values.parentId = null;
    }
    onSave(values);
    setOpen(false);
  };
  
  const type = form.watch('type');

  return (
    <Dialog open={isOpen} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-[425px]">
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
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 py-4">
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
            )}
            
            {type === 'objective' && (
              <>
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
              </>
            )}
            
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
