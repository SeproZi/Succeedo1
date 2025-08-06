'use client';
import { OkrDashboard } from '@/components/app/okr-dashboard';
import useOkrStore from '@/hooks/use-okr-store';
import { useParams } from 'next/navigation';

export default function DepartmentOkrPage() {
    const params = useParams();
    const id = params.id as string;
    const { data: { departments }, loading } = useOkrStore();
    const department = departments.find(d => d.id === id);

    const title = loading ? "Loading..." : department ? `${department.title} Department` : "Department";

    return (
        <OkrDashboard
            owner={{ type: 'department', id: id }}
            title={title}
        />
    );
}
