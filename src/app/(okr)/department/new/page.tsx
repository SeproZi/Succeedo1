'use client';

import { Button } from '@/components/ui/button';
import { useOkrStore } from '@/hooks/use-okr-store';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { AddDepartmentDialog } from '@/components/app/add-department-dialog';

export default function NewDepartmentPage() {
  const { addDepartment, data } = useOkrStore();
  const router = useRouter();
  const [isDialogOpen, setDialogOpen] = useState(false);

  const handleSaveDepartment = (title: string) => {
    if (title) {
      const newId = Date.now().toString();
      addDepartment(title, newId);
      setDialogOpen(false);
      router.push(`/department/${newId}`);
    }
  };

  // Redirect if departments already exist
  if (data.departments.length > 0) {
    router.replace(`/department/${data.departments[0].id}`);
    return null; 
  }

  return (
    <>
    <div className="flex flex-col items-center justify-center h-full min-h-[calc(100vh-10rem)] bg-background p-8 text-center">
      <h1 className="text-4xl font-bold font-headline text-primary mb-4">
        Welcome to Succeedo
      </h1>
      <p className="text-lg text-muted-foreground mb-8 max-w-2xl">
        It looks like you're new here. Let's get started by creating your first department. 
        You can think of departments as the main teams or areas in your organization.
      </p>
      <Button size="lg" onClick={() => setDialogOpen(true)}>
        Create Your First Department
      </Button>
    </div>
    <AddDepartmentDialog 
        isOpen={isDialogOpen}
        setOpen={setDialogOpen}
        onSave={handleSaveDepartment}
        title="Create Your First Department"
        description="Enter the name for the main team or area in your organization."
    />
    </>
  );
}
