'use client';
import { OkrDashboard } from '@/components/app/okr-dashboard';
import { useOkrStore } from '@/hooks/use-okr-store';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { useSidebar } from '@/components/ui/sidebar';

export default function DepartmentOkrPage({ params }: { params: { id: string }}) {
    const department = useOkrStore(state => state.data.departments.find(d => d.id === params.id));

    if (!department) {
        return <div>Department not found.</div>;
    }

    return (
        <OkrDashboard
            owner={{ type: 'department', id: params.id }}
            title={`${department.title} Department`}
        />
    );
}
