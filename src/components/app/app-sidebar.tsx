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
        <path d="M50,0C22.4,0,0,22.4,0,50s22.4,50,50,50c13.4,0,25.4-5.2,34.3-13.5c-1.3-1.6-2.5-3.4-3.5-5.3c-7.2,5.5-16.3,8.8-26.1,8.8c-22.1,0-40-17.9-40-40s17.9-40,40-40c9.8,0,18.9,3.5,26.1,9.2c1-1.9,2.2-3.7,3.5-5.4C75.4,5.2,63.4,0,50,0z" fill="#E67700"/>
        <path d="M98.5,24.8c-2.7-5.5-6.5-10.2-11.2-13.9c-1,1.9-2.2,3.7-3.5,5.4c3.3,2.8,6,6.5,7.9,10.6c2.5,5.4,3.8,11.3,3.8,17.5c0,6.2-1.3,12.1-3.8,17.5c-1.9,4.1-4.6,7.8-7.9,10.6c1.3,1.7,2.5,3.4,3.5,5.3c4.6-3.7,8.5-8.4,11.2-13.9c3.6-7.2,5.5-15.6,5.5-24.3C104,40.4,102.1,32,98.5,24.8z" fill="#293B5F"/>
        <path d="M37.8,63.7C28.9,55.2,28,42.4,35.7,33c1-1.9,2.2-3.7,3.5-5.4c-10.2,5.2-15.6,16.2-13.3,27.9c2.3,11.7,12.2,20.5,23.9,21.1c2.2,0.1,4.4,0,6.5-0.3c1-1.8,2-3.6,2.9-5.5C51.6,68.2,45.2,68.4,37.8,63.7z" fill="#293B5F"/>
        <path d="M66.4,27.8c-7.8-9.4-20.8-11.4-30.9-4.9c-1.3,0.8-2.5,1.7-3.7,2.7c1.3,1.6,2.5,3.4,3.5,5.3c1.7-1.3,3.5-2.5,5.4-3.5c6.3-3.1,13.6-1.9,18.5,3.4c5,5.3,6.3,13,3.4,19.2c-0.9,1.9-2,3.7-2.9,5.5c4.7-6.2,5.5-14.3,2-21.2C69.3,32.2,68.1,29.9,66.4,27.8z" fill="#E67700"/>
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

    