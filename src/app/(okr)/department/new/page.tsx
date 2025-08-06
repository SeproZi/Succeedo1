'use client';

import { Button } from '@/components/ui/button';
import useOkrStore from '@/hooks/use-okr-store';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { AddDepartmentDialog } from '@/components/app/add-department-dialog';

export default function NewDepartmentPage() {
  const { addDepartment, data, loading } = useOkrStore();
  const router = useRouter();
  const [isDialogOpen, setDialogOpen] = useState(false);

  useEffect(() => {
    // If data is loaded and departments exist, redirect to the first one.
    // This prevents staying on the 'new' page if departments are created elsewhere.
    if (!loading && data.departments.length > 0) {
      router.replace(`/department/${data.departments[0].id}`);
    }
  }, [data.departments, loading, router]);


  const handleSaveDepartment = (title: string) => {
    if (title) {
      const newId = Date.now().toString();
      addDepartment(title, newId);
      setDialogOpen(false);
      router.push(`/department/${newId}`);
    }
  };
  
  // While loading, we can show a placeholder or nothing
  if (loading) {
      return <div className="flex h-screen items-center justify-center">
                <p>Loading...</p>
            </div>;
  }
  
  // If not loading and there are departments, the useEffect will handle redirection.
  // If not loading and NO departments, show the creation UI.
  if (!loading && data.departments.length === 0) {
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

  // Fallback for any other state, though should mostly be handled above.
  return <div className="flex h-screen items-center justify-center">
            <p>Loading...</p>
        </div>;
}
