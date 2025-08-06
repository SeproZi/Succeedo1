'use client';
import { OkrDashboard } from '@/components/app/okr-dashboard';
import useOkrStore from '@/hooks/use-okr-store';
import { useParams } from 'next/navigation';

export default function DepartmentOkrPage() {
    const params = useParams();
    const id = params.id as string;
    const { data: { departments }, loading } = useOkrStore();
    const department = departments.find(d => d.id === id);

    if (loading) {
        return (
            <OkrDashboard
                owner={{ type: 'department', id: id }}
                title="Loading..."
            />
        );
    }

    if (!department) {
        return <div className="p-8">Department not found.</div>;
    }

    return (
        <OkrDashboard
            owner={{ type: 'department', id: id }}
            title={`${department.title} Department`}
        />
    );
}

    