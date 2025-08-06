'use client';
import { OkrDashboard } from '@/components/app/okr-dashboard';
import { useOkrStore } from '@/hooks/use-okr-store';
import { useParams } from 'next/navigation';

export default function DepartmentOkrPage() {
    const params = useParams();
    const id = params.id as string;
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
