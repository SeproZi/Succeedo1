'use client';
import { OkrDashboard } from '@/components/app/okr-dashboard';
import useOkrStore from '@/hooks/use-okr-store';
import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function DepartmentOkrPage() {
    const params = useParams();
    const id = params.id as string;
    const { data: { departments }, loading } = useOkrStore();
    
    // Local state to manage the current department being viewed
    const [department, setDepartment] = useState(() => departments.find(d => d.id === id));

    useEffect(() => {
        // When the `id` from the URL or the list of departments changes,
        // find and set the correct department for the dashboard.
        const currentDepartment = departments.find(d => d.id === id);
        setDepartment(currentDepartment);
    }, [id, departments]);

    const title = loading ? "Loading..." : department ? `${department.title} Department` : "Department";

    return (
        <OkrDashboard
            owner={{ type: 'department', id: id }}
            title={title}
        />
    );
}
