'use client';

import { Button } from '@/components/ui/button';
import { useOkrStore } from '@/hooks/use-okr-store';
import { useRouter } from 'next/navigation';

export default function NewDepartmentPage() {
  const { addDepartment, data } = useOkrStore();
  const router = useRouter();

  const handleAddDepartment = () => {
    const title = prompt('Enter the name for your first department:');
    if (title) {
      const newId = Date.now().toString();
      addDepartment(title);
      // Manually find the new department as state update might be async
      router.push(`/department/${newId}`);
    }
  };

  // Redirect if departments already exist
  if (data.departments.length > 0) {
    router.replace(`/department/${data.departments[0].id}`);
    return null; 
  }

  return (
    <div className="flex flex-col items-center justify-center h-full min-h-[calc(100vh-10rem)] bg-background p-8 text-center">
      <h1 className="text-4xl font-bold font-headline text-primary mb-4">
        Welcome to OKR Vision
      </h1>
      <p className="text-lg text-muted-foreground mb-8 max-w-2xl">
        It looks like you're new here. Let's get started by creating your first department. 
        You can think of departments as the main teams or areas in your organization.
      </p>
      <Button size="lg" onClick={handleAddDepartment}>
        Create Your First Department
      </Button>
    </div>
  );
}
