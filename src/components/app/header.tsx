'use client';

import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useOkrStore } from '@/hooks/use-okr-store';
import { SidebarTrigger } from '../ui/sidebar';
import type { TimelinePeriod } from '@/lib/types';
import { Plus } from 'lucide-react';
import { Separator } from '../ui/separator';
import { useToast } from '@/hooks/use-toast';

export function Header({ title }: { title: string }) {
  const { currentYear, currentPeriod, setYear, setPeriod, availableYears, addYear } = useOkrStore();
  const { toast } = useToast();

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
    <header className="bg-card shadow-sm sticky top-0 z-40 border-b">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          <div className="flex items-center space-x-3">
             <div className="p-1">
                <SidebarTrigger />
             </div>
             <h1 className="text-2xl font-bold font-headline text-primary">
                {title}
             </h1>
          </div>
          <div className="flex items-center gap-4">
            <Select value={String(currentYear)} onValueChange={(val) => setYear(Number(val))}>
                <SelectTrigger className="w-[120px]">
                    <SelectValue placeholder="Year" />
                </SelectTrigger>
                <SelectContent>
                    {availableYears.map(year => (
                        <SelectItem key={year} value={String(year)}>{year}</SelectItem>
                    ))}
                    <Separator className="my-1" />
                    <div className="p-2">
                        <Button variant="outline" size="sm" className="w-full" onClick={handleAddYear}>
                            <Plus className="mr-2 h-4 w-4" />
                            Add Year
                        </Button>
                    </div>
                </SelectContent>
            </Select>
            <Select value={currentPeriod} onValueChange={(val) => setPeriod(val as TimelinePeriod)}>
                <SelectTrigger className="w-[120px]">
                    <SelectValue placeholder="Period" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="P1">Period 1</SelectItem>
                    <SelectItem value="P2">Period 2</SelectItem>
                    <SelectItem value="P3">Period 3</SelectItem>
                </SelectContent>
            </Select>
          </div>
        </div>
      </div>
    </header>
  );
}

    