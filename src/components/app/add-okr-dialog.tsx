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
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
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
});

type AddOkrDialogProps = {
  isOpen: boolean;
  setOpen: (isOpen: boolean) => void;
  okrData: OkrItem | { parentId: string | null } | null;
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
    },
  });

  useEffect(() => {
    if (okrData) {
      form.reset({
        id: (okrData && 'id' in okrData && okrData.id) || '',
        title: (okrData && 'title' in okrData && okrData.title) || '',
        type: (okrData && 'type' in okrData && okrData.type) || (okrData?.parentId ? 'keyResult' : 'objective'),
        parentId: okrData?.parentId || null,
      });
    }
  }, [okrData, form]);

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    onSave(values);
    setOpen(false);
  };

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

            <FormField
              control={form.control}
              name="parentId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Parent Objective</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value ?? 'null'}>
                    <FormControl>
                      <SelectTrigger disabled={!!okrData?.parentId}>
                        <SelectValue placeholder="Select a parent objective" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="null">None (Top-level Objective)</SelectItem>
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
            
            <FormField
              control={form.control}
              name="type"
              render={({ field }) => (
                <FormItem className="space-y-3">
                  <FormLabel>Type</FormLabel>
                  <FormControl>
                    <RadioGroup
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      className="flex items-center space-x-4"
                    >
                      <FormItem className="flex items-center space-x-2 space-y-0">
                        <FormControl>
                          <RadioGroupItem value="objective" />
                        </FormControl>
                        <FormLabel className="font-normal">Objective</FormLabel>
                      </FormItem>
                      <FormItem className="flex items-center space-x-2 space-y-0">
                        <FormControl>
                          <RadioGroupItem value="keyResult" />
                        </FormControl>
                        <FormLabel className="font-normal">Key Result</FormLabel>
                      </FormItem>
                    </RadioGroup>
                  </FormControl>
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
