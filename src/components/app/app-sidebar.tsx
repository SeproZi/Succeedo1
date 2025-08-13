
'use client';
import {
    SidebarContent,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuItem,
    SidebarMenuButton,
    SidebarFooter,
    SidebarMenuSub,
    SidebarMenuSubItem,
    SidebarMenuSubButton,
    useSidebar,
    SidebarSeparator,
    SidebarMenuSkeleton,
} from '@/components/ui/sidebar';
import useOkrStore from '@/hooks/use-okr-store';
import { Building, Users, ChevronsRight, Plus, MoreHorizontal, LogOut, LayoutGrid } from 'lucide-react';
import Link from 'next/link';
import { useParams, useRouter, usePathname } from 'next/navigation';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '../ui/button';
import { cn } from '@/lib/utils';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { useState, useEffect } from 'react';
import { AddDepartmentDialog } from './add-department-dialog';
import { AddTeamDialog } from './add-team-dialog';
import { ConfirmationDialog } from './confirmation-dialog';
import { EditTeamDialog } from './edit-team-dialog';
import { EditDepartmentDialog } from './edit-department-dialog';
import { useAuth } from './auth-provider';

const Logo = () => (
    <svg width="32" height="32" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
        <defs>
            <linearGradient id="grad1" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" style={{stopColor: 'hsl(var(--chart-2))', stopOpacity:1}} />
                <stop offset="100%" style={{stopColor: 'hsl(var(--chart-4))', stopOpacity:1}} />
            </linearGradient>
            <linearGradient id="grad2" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" style={{stopColor: 'hsl(var(--chart-3))', stopOpacity:1}} />
                <stop offset="100%" style={{stopColor: 'hsl(var(--chart-1))', stopOpacity:1}} />
            </linearGradient>
        </defs>
        <path 
            d="M 85,20 C 85,5 65,5 50,20 C 35,35 15,35 15,50 C 15,65 35,65 50,50 C 65,35 85,35 85,20" 
            fill="url(#grad1)"
            transform="rotate(15 50 50)"
        />
        <path 
            d="M 15,80 C 15,95 35,95 50,80 C 65,65 85,65 85,50 C 85,35 65,35 50,50 C 35,65 15,65 15,80"
            fill="url(#grad2)"
            transform="rotate(15 50 50)"
        />
    </svg>
);

export function AppSidebar() {
    const { data, addDepartment, updateDepartment, addTeam, deleteDepartment, updateTeam, deleteTeam, loading } = useOkrStore();
    const { logout } = useAuth();
    const params = useParams();
    const router = useRouter();
    const pathname = usePathname();
    const { id: departmentId, teamId } = params;
    const { state } = useSidebar();
    const isCollapsed = state === 'collapsed';
    const [isAddDepartmentOpen, setAddDepartmentOpen] = useState(false);
    const [isAddTeamOpen, setAddTeamOpen] = useState(false);
    const [isDeleteDeptOpen, setDeleteDeptOpen] = useState(false);
    const [isDeleteTeamOpen, setDeleteTeamOpen] = useState(false);
    const [isEditTeamOpen, setEditTeamOpen] = useState(false);
    const [isEditDeptOpen, setEditDeptOpen] = useState(false);

    const [selectedDepartment, setSelectedDepartment] = useState<string | null>(null);
    const [itemToEdit, setItemToEdit] = useState<{id: string, title: string, type: 'department' | 'team'} | null>(null);
    const [itemToDelete, setItemToDelete] = useState<{id: string; title: string; type: 'department' | 'team'} | null>(null);

    useEffect(() => {
        if (!loading && data.departments.length === 0 && pathname !== '/department/new') {
            router.push('/department/new');
        }
    }, [data.departments, loading, router, pathname]);


    const handleSaveDepartment = async (title: string) => {
        if (title) {
            const newId = await addDepartment(title);
            setAddDepartmentOpen(false);
            if (newId) {
                router.push(`/department/${newId}`);
            }
        }
    };
    
    const handleSaveTeam = async (title: string) => {
        if (title && selectedDepartment) {
            await addTeam(title, selectedDepartment);
            setAddTeamOpen(false);
            setSelectedDepartment(null);
        }
    };

    const openAddTeamDialog = (deptId: string) => {
        setSelectedDepartment(deptId);
        setAddTeamOpen(true);
    };

    const openDeleteDialog = (id: string, title: string, type: 'department' | 'team') => {
        setItemToDelete({ id, title, type });
        if (type === 'department') {
            setDeleteDeptOpen(true);
        } else {
            setDeleteTeamOpen(true);
        }
    };
    
    const openEditDialog = (item: {id: string, title: string}, type: 'department' | 'team') => {
        setItemToEdit({ ...item, type });
        if (type === 'department') {
            setEditDeptOpen(true);
        } else {
            setEditTeamOpen(true);
        }
    };

    const handleSaveEdit = async (newTitle: string) => {
        if (!itemToEdit) return;

        if (itemToEdit.type === 'department') {
            await updateDepartment(itemToEdit.id, newTitle);
        } else {
            await updateTeam(itemToEdit.id, newTitle);
        }
        setEditTeamOpen(false);
        setEditDeptOpen(false);
        setItemToEdit(null);
    };

    const confirmDelete = async () => {
        if (!itemToDelete) return;

        if (itemToDelete.type === 'department') {
            await deleteDepartment(itemToDelete.id);
            if (params.id === itemToDelete.id) {
                const nextDept = data.departments.find(d => d.id !== itemToDelete.id);
                if (nextDept) {
                    router.push(`/department/${nextDept.id}`);
                } else {
                    router.push('/department/new');
                }
            }
        } else if (itemToDelete.type === 'team') {
            await deleteTeam(itemToDelete.id);
            if (params.teamId === itemToDelete.id) {
                router.push(`/department/${params.id}`);
            }
        }

        setDeleteDeptOpen(false);
        setDeleteTeamOpen(false);
        setItemToDelete(null);
    };

    return (
        <>
            <SidebarHeader className='p-4'>
                <div className={cn("flex items-center", isCollapsed ? 'justify-center' : 'justify-between')}>
                    <div className={cn("flex items-center space-x-3", isCollapsed && 'space-x-0')}>
                        <div className="p-1 bg-background rounded-md">
                            <Logo />
                        </div>
                       {!isCollapsed && (
                         <div>
                            <h1 className="text-2xl font-bold font-headline text-sidebar-primary-foreground">
                               Succeedo
                            </h1>
                        </div>
                       )}
                    </div>
                </div>
            </SidebarHeader>
            <SidebarContent>
                <SidebarMenu>
                     <SidebarMenuItem>
                        <SidebarMenuButton
                            asChild
                            isActive={pathname === '/company-overview'}
                            tooltip="Company Overview"
                        >
                            <Link href="/company-overview">
                                <LayoutGrid />
                                <span>Company Overview</span>
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                    <SidebarSeparator />
                     {loading && (
                        <div className="p-2 space-y-2">
                           <SidebarMenuSkeleton showIcon />
                           <SidebarMenuSkeleton showIcon />
                        </div>
                     )}
                    {!loading && data.departments.map(dept => {
                        const teams = data.teams.filter(t => t.departmentId === dept.id);
                        return (
                            <SidebarMenuItem key={dept.id}>
                                <div className="relative group/item">
                                    <SidebarMenuButton 
                                        asChild
                                        isActive={departmentId === dept.id && !teamId}
                                        tooltip={dept.title}
                                    >
                                        <Link href={`/department/${dept.id}`}>
                                            <Building />
                                            <span>{dept.title}</span>
                                        </Link>
                                    </SidebarMenuButton>
                                    <div className="absolute right-1 top-1.5 opacity-0 group-hover/item:opacity-100 transition-opacity">
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="ghost" size="icon" className="h-6 w-6">
                                                    <MoreHorizontal className="h-4 w-4" />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent>
                                                <DropdownMenuItem onClick={() => openEditDialog(dept, 'department')}>Edit Department</DropdownMenuItem>
                                                <DropdownMenuItem onClick={() => openAddTeamDialog(dept.id)}>Add Team</DropdownMenuItem>
                                                <DropdownMenuItem onClick={() => openDeleteDialog(dept.id, dept.title, 'department')} className="text-destructive">Delete Department</DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </div>
                                </div>
                                {teams.length > 0 && (
                                    <SidebarMenuSub>
                                        {teams.map(team => (
                                            <SidebarMenuSubItem key={team.id} className="relative group/sub-item">
                                                <SidebarMenuSubButton asChild isActive={teamId === team.id}>
                                                    <Link href={`/department/${dept.id}/team/${team.id}`}>
                                                        <Users />
                                                        <span>{team.title}</span>
                                                    </Link>
                                                </SidebarMenuSubButton>
                                                <div className="absolute right-1 top-0.5 opacity-0 group-hover/sub-item:opacity-100 transition-opacity">
                                                  <DropdownMenu>
                                                      <DropdownMenuTrigger asChild>
                                                          <Button variant="ghost" size="icon" className="h-6 w-6">
                                                              <MoreHorizontal className="h-4 w-4" />
                                                          </Button>
                                                      </DropdownMenuTrigger>
                                                      <DropdownMenuContent>
                                                          <DropdownMenuItem onClick={() => openEditDialog(team, 'team')}>Edit Team</DropdownMenuItem>
                                                          <DropdownMenuItem onClick={() => openDeleteDialog(team.id, team.title, 'team')} className="text-destructive">Delete Team</DropdownMenuItem>
                                                      </DropdownMenuContent>
                                                  </DropdownMenu>
                                                </div>
                                            </SidebarMenuSubItem>
                                        ))}
                                    </SidebarMenuSub>
                                )}
                            </SidebarMenuItem>
                        );
                    })}
                </SidebarMenu>
            </SidebarContent>
            <SidebarFooter>
                <Button variant="ghost" className="w-full justify-start" onClick={() => setAddDepartmentOpen(true)}>
                    <Plus className="mr-2 h-4 w-4" />
                    {state === 'expanded' && <span>Add Department</span>}
                </Button>
                <SidebarSeparator />
                <Button variant="ghost" className="w-full justify-start" onClick={logout}>
                    <LogOut className="mr-2 h-4 w-4" />
                     {state === 'expanded' && <span>Log Out</span>}
                </Button>
            </SidebarFooter>
            <AddDepartmentDialog 
                isOpen={isAddDepartmentOpen}
                setOpen={setAddDepartmentOpen}
                onSave={handleSaveDepartment}
                title="Create a New Department"
                description="Give your new department a name. You can add teams to it later."
            />
            <AddTeamDialog
                isOpen={isAddTeamOpen}
                setOpen={setAddTeamOpen}
                onSave={handleSaveTeam}
            />
            {itemToEdit?.type === 'team' && (
                <EditTeamDialog
                    isOpen={isEditTeamOpen}
                    setOpen={setEditTeamOpen}
                    onSave={handleSaveEdit}
                    currentTitle={itemToEdit.title}
                />
            )}
            {itemToEdit?.type === 'department' && (
                <EditDepartmentDialog
                    isOpen={isEditDeptOpen}
                    setOpen={setEditDeptOpen}
                    onSave={handleSaveEdit}
                    currentTitle={itemToEdit.title}
                />
            )}
            <ConfirmationDialog
                isOpen={isDeleteDeptOpen}
                setOpen={setDeleteDeptOpen}
                onConfirm={confirmDelete}
                title="Delete Department?"
                description={`Are you sure you want to delete the "${itemToDelete?.title}" department? This will also delete all its teams and their OKRs. This action cannot be undone.`}
            />
             <ConfirmationDialog
                isOpen={isDeleteTeamOpen}
                setOpen={setDeleteTeamOpen}
                onConfirm={confirmDelete}
                title="Delete Team?"
                description={`Are you sure you want to delete the "${itemToDelete?.title}" team? This will also delete all of its OKRs. This action cannot be undone.`}
            />
        </>
    );
}

    
