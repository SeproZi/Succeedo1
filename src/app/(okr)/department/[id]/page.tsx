'use client';
import { OkrDashboard } from '@/components/app/okr-dashboard';
import { useOkrStore } from '@/hooks/use-okr-store';

export default function DepartmentOkrPage({ params }: { params: { id: string }}) {
    const { id } = params;
    const department = useOkrStore(state => state.data.departments.find(d => d.id === id));

    if (!department) {
        return <div>Department not found.</div>;
    }

    return (
        <OkrDashboard
            owner={{ type: 'department', id: id }}
            title={`${department.title} Department`}
        />
    );
}
