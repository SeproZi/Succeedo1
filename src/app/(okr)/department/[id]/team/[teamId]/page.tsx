'use client';
import { OkrDashboard } from '@/components/app/okr-dashboard';
import useOkrStore from '@/hooks/use-okr-store';
import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function TeamOkrPage() {
    const params = useParams();
    const departmentId = params.id as string;
    const teamId = params.teamId as string;
    const { data: { teams }, loading } = useOkrStore();

    // Local state to manage the current team being viewed
    const [team, setTeam] = useState(() => teams.find(t => t.id === teamId && t.departmentId === departmentId));

    useEffect(() => {
        // When the IDs from the URL or the list of teams changes,
        // find and set the correct team for the dashboard.
        const currentTeam = teams.find(t => t.id === teamId && t.departmentId === departmentId);
        setTeam(currentTeam);
    }, [teamId, departmentId, teams]);

    const title = loading ? "Loading..." : team ? `${team.title} Team` : "Team";
    
    return (
        <OkrDashboard
            owner={{ type: 'team', id: teamId, departmentId: departmentId }}
            title={title}
        />
    );
}
