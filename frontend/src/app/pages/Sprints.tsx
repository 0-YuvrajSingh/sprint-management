import { Calendar, CheckCircle2, Clock, FileText, Filter, Info, Plus, Search, Target, Timer } from 'lucide-react';
import { useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router';
import { toast } from 'sonner';
import { DetailsDrawer } from '../components/DetailsDrawer';
import { PageContainer } from '../components/ui/PageContainer';
import { PageHeader } from '../components/ui/PageHeader';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle
} from '../components/ui/alert-dialog';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import { Card, CardContent } from '../components/ui/card';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '../components/ui/dialog';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '../components/ui/select';
import { useAuth } from '../context/AuthContext';
import { useAppStore } from '../store/useAppStore';
import { Sprint, SprintStatus } from '../types';

export default function Sprints() {
  const navigate = useNavigate();
  const { hasRole } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const {
    sprints,
    completeSprint,
    projects,
    createSprint,
    updateSprint,
    deleteSprint,
  } = useAppStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [projectFilter, setProjectFilter] = useState<string>('all');
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isCreatingSprint, setIsCreatingSprint] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isUpdatingSprint, setIsUpdatingSprint] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [isDeletingSprint, setIsDeletingSprint] = useState(false);
  const [createForm, setCreateForm] = useState({
    name: '',
    projectId: '',
    startDate: '',
    endDate: '',
    status: 'PLANNED' as SprintStatus,
    velocity: '',
  });
  const [editForm, setEditForm] = useState({
    id: '',
    name: '',
    projectId: '',
    startDate: '',
    endDate: '',
    status: 'PLANNED' as SprintStatus,
    velocity: '',
  });
  const [createErrors, setCreateErrors] = useState<{
    name?: string;
    projectId?: string;
    startDate?: string;
    endDate?: string;
    velocity?: string;
  }>({});
  const [editErrors, setEditErrors] = useState<{
    name?: string;
    projectId?: string;
    startDate?: string;
    endDate?: string;
    velocity?: string;
  }>({});

  // Action State Machine
  const [actionState, setActionState] = useState<{
    type: 'COMPLETE' | null;
    status: 'IDLE' | 'CONFIRMING' | 'PROCESSING' | 'SUCCESS';
    targetId: string | null;
  }>({ type: null, status: 'IDLE', targetId: null });

  const selectedSprintId = searchParams.get('sprintId');
  const selectedSprint = useMemo(() =>
    sprints.find((s: Sprint) => s.id === selectedSprintId) || null
  , [sprints, selectedSprintId]);

  const resetCreateForm = () => {
    setCreateForm({
      name: '',
      projectId: projects[0]?.id || '',
      startDate: '',
      endDate: '',
      status: 'PLANNED',
      velocity: '',
    });
    setCreateErrors({});
  };

  const toDateInputValue = (date: Date | string): string => {
    const parsed = typeof date === 'string' ? new Date(date) : date;
    if (Number.isNaN(parsed.getTime())) {
      return '';
    }
    return parsed.toISOString().slice(0, 10);
  };

  const validateSprintForm = (form: {
    name: string;
    projectId: string;
    startDate: string;
    endDate: string;
    velocity: string;
  }) => {
    const errors: {
      name?: string;
      projectId?: string;
      startDate?: string;
      endDate?: string;
      velocity?: string;
    } = {};

    if (!form.name.trim()) {
      errors.name = 'Sprint name is required.';
    }
    if (!form.projectId) {
      errors.projectId = 'Project is required.';
    }
    if (!form.startDate) {
      errors.startDate = 'Start date is required.';
    }
    if (!form.endDate) {
      errors.endDate = 'End date is required.';
    }
    if (form.startDate && form.endDate) {
      const startTime = new Date(form.startDate).getTime();
      const endTime = new Date(form.endDate).getTime();
      if (endTime < startTime) {
        errors.endDate = 'End date cannot be before start date.';
      }
    }

    if (form.velocity.trim().length > 0) {
      const velocity = Number(form.velocity);
      if (!Number.isFinite(velocity) || velocity < 0) {
        errors.velocity = 'Velocity must be a non-negative number.';
      }
    }

    return errors;
  };

  const handleSprintClick = (id: string) => {
    setSearchParams({ sprintId: id });
  };

  const closeDrawer = () => {
    setSearchParams({});
  };

  const openEditForSelectedSprint = () => {
    if (!selectedSprint) {
      return;
    }

    setEditForm({
      id: selectedSprint.id,
      name: selectedSprint.name,
      projectId: selectedSprint.projectId,
      startDate: toDateInputValue(selectedSprint.startDate),
      endDate: toDateInputValue(selectedSprint.endDate),
      status: selectedSprint.status,
      velocity: selectedSprint.goal.startsWith('Target velocity:')
        ? selectedSprint.goal.replace('Target velocity:', '').replace('points', '').trim()
        : '',
    });
    setEditErrors({});
    setIsEditOpen(true);
  };

  const initiateComplete = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    setActionState({ type: 'COMPLETE', status: 'CONFIRMING', targetId: id });
  };

  const handleComplete = async () => {
    if (!actionState.targetId) return;

    setActionState(prev => ({ ...prev, status: 'PROCESSING' }));

    try {
      await completeSprint(actionState.targetId);

      toast.success('Sprint completed successfully', {
        description: 'All stories have been archived and velocity has been updated.',
      });

      setActionState({ type: null, status: 'IDLE', targetId: null });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to complete sprint.';
      toast.error(message);
      setActionState({ type: null, status: 'IDLE', targetId: null });
    }
  };

  const handleCreateSprint = async (event: React.FormEvent) => {
    event.preventDefault();

    const validationErrors = validateSprintForm(createForm);
    setCreateErrors(validationErrors);
    if (Object.keys(validationErrors).length > 0) {
      return;
    }

    const parsedVelocity = createForm.velocity.trim().length > 0
      ? Number(createForm.velocity)
      : undefined;

    setIsCreatingSprint(true);
    try {
      await createSprint({
        name: createForm.name.trim(),
        projectId: createForm.projectId,
        startDate: createForm.startDate,
        endDate: createForm.endDate,
        status: createForm.status,
        velocity: parsedVelocity,
      });

      toast.success('Sprint created successfully.');
      setIsCreateOpen(false);
      resetCreateForm();
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to create sprint.';
      toast.error(message);
    } finally {
      setIsCreatingSprint(false);
    }
  };

  const handleEditSprint = async (event: React.FormEvent) => {
    event.preventDefault();

    const validationErrors = validateSprintForm(editForm);
    setEditErrors(validationErrors);
    if (Object.keys(validationErrors).length > 0) {
      return;
    }

    const parsedVelocity = editForm.velocity.trim().length > 0
      ? Number(editForm.velocity)
      : undefined;

    setIsUpdatingSprint(true);
    try {
      await updateSprint({
        id: editForm.id,
        name: editForm.name.trim(),
        projectId: editForm.projectId,
        startDate: editForm.startDate,
        endDate: editForm.endDate,
        status: editForm.status,
        velocity: parsedVelocity,
      });

      toast.success('Sprint updated successfully.');
      setIsEditOpen(false);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to update sprint.';
      toast.error(message);
    } finally {
      setIsUpdatingSprint(false);
    }
  };

  const handleDeleteSprint = async () => {
    if (!selectedSprint) {
      return;
    }

    setIsDeletingSprint(true);
    try {
      await deleteSprint(selectedSprint.id);
      toast.success('Sprint deleted successfully.');
      setIsDeleteOpen(false);
      closeDrawer();
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to delete sprint.';
      toast.error(message);
    } finally {
      setIsDeletingSprint(false);
    }
  };

  // Filter sprints
  const filteredSprints = sprints.filter((sprint: Sprint) => {
    const matchesSearch =
      sprint.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      sprint.projectName.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || sprint.status === statusFilter;
    const matchesProject = projectFilter === 'all' || sprint.projectId === projectFilter;
    return matchesSearch && matchesStatus && matchesProject;
  });

  const getStatusColor = (status: SprintStatus) => {
    switch (status) {
      case 'ACTIVE':
        return 'bg-green-100 text-green-700 border-green-200';
      case 'PLANNED':
        return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'COMPLETED':
        return 'bg-gray-100 text-gray-700 border-gray-200';
      default:
        return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const getDaysLeft = (endDate: Date | string) => {
    const d = typeof endDate === 'string' ? new Date(endDate) : endDate;
    return Math.ceil((d.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
  };

  const drawerActions = selectedSprint
    ? [
        {
          label: 'Open Board',
          onClick: () => navigate(`/stories?sprintId=${selectedSprint.id}`),
          variant: 'default' as const,
        },
        ...(hasRole(['ADMIN', 'MANAGER'])
          ? [
              {
                label: 'Edit Sprint',
                onClick: openEditForSelectedSprint,
                variant: 'outline' as const,
              },
            ]
          : []),
        ...(hasRole(['ADMIN'])
          ? [
              {
                label: 'Delete Sprint',
                onClick: () => setIsDeleteOpen(true),
                variant: 'destructive' as const,
              },
            ]
          : []),
        {
          label: 'Close',
          onClick: closeDrawer,
          variant: 'outline' as const,
        },
      ]
    : [];

  return (
    <PageContainer>
      <PageHeader
        title="Sprints"
        subtitle="Plan and track your sprint cycles"
        actions={
          hasRole(['ADMIN', 'MANAGER']) && (
            <Dialog
              open={isCreateOpen}
              onOpenChange={(open) => {
                setIsCreateOpen(open);
                if (open) {
                  resetCreateForm();
                }
              }}
            >
              <DialogTrigger asChild>
                <Button className="gap-2">
                  <Plus className="w-4 h-4" />
                  New Sprint
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[520px]">
                <DialogHeader>
                  <DialogTitle>Create Sprint</DialogTitle>
                  <DialogDescription>
                    Create a new sprint and assign it to a project.
                  </DialogDescription>
                </DialogHeader>
                <form className="space-y-4" onSubmit={handleCreateSprint}>
                  <div className="space-y-2">
                    <Label htmlFor="sprintName">Sprint Name</Label>
                    <Input
                      id="sprintName"
                      value={createForm.name}
                      onChange={(event) => {
                        setCreateForm((previous) => ({
                          ...previous,
                          name: event.target.value,
                        }));
                        if (createErrors.name) {
                          setCreateErrors((previous) => ({ ...previous, name: undefined }));
                        }
                      }}
                      placeholder="Sprint 16 - Release Stabilization"
                      required
                    />
                    {createErrors.name && <p className="text-xs text-destructive">{createErrors.name}</p>}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="sprintProject">Project</Label>
                    <Select
                      value={createForm.projectId}
                      onValueChange={(value) => {
                        setCreateForm((previous) => ({
                          ...previous,
                          projectId: value,
                        }));
                        if (createErrors.projectId) {
                          setCreateErrors((previous) => ({ ...previous, projectId: undefined }));
                        }
                      }}
                    >
                      <SelectTrigger id="sprintProject">
                        <SelectValue placeholder="Select project" />
                      </SelectTrigger>
                      <SelectContent>
                        {projects.map((project) => (
                          <SelectItem key={project.id} value={project.id}>{project.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {createErrors.projectId && <p className="text-xs text-destructive">{createErrors.projectId}</p>}
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="sprintStartDate">Start Date</Label>
                      <Input
                        id="sprintStartDate"
                        type="date"
                        value={createForm.startDate}
                        onChange={(event) => {
                          setCreateForm((previous) => ({
                            ...previous,
                            startDate: event.target.value,
                          }));
                          if (createErrors.startDate) {
                            setCreateErrors((previous) => ({ ...previous, startDate: undefined }));
                          }
                        }}
                        required
                      />
                      {createErrors.startDate && <p className="text-xs text-destructive">{createErrors.startDate}</p>}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="sprintEndDate">End Date</Label>
                      <Input
                        id="sprintEndDate"
                        type="date"
                        value={createForm.endDate}
                        onChange={(event) => {
                          setCreateForm((previous) => ({
                            ...previous,
                            endDate: event.target.value,
                          }));
                          if (createErrors.endDate) {
                            setCreateErrors((previous) => ({ ...previous, endDate: undefined }));
                          }
                        }}
                        required
                      />
                      {createErrors.endDate && <p className="text-xs text-destructive">{createErrors.endDate}</p>}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="sprintStatus">Status</Label>
                      <Select
                        value={createForm.status}
                        onValueChange={(value: SprintStatus) => setCreateForm((previous) => ({
                          ...previous,
                          status: value,
                        }))}
                      >
                        <SelectTrigger id="sprintStatus">
                          <SelectValue placeholder="Select status" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="PLANNED">Planned</SelectItem>
                          <SelectItem value="ACTIVE">Active</SelectItem>
                          <SelectItem value="COMPLETED">Completed</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="sprintVelocity">Velocity (optional)</Label>
                      <Input
                        id="sprintVelocity"
                        type="number"
                        min={0}
                        value={createForm.velocity}
                        onChange={(event) => {
                          setCreateForm((previous) => ({
                            ...previous,
                            velocity: event.target.value,
                          }));
                          if (createErrors.velocity) {
                            setCreateErrors((previous) => ({ ...previous, velocity: undefined }));
                          }
                        }}
                        placeholder="40"
                      />
                      {createErrors.velocity && <p className="text-xs text-destructive">{createErrors.velocity}</p>}
                    </div>
                  </div>

                  <DialogFooter>
                    <Button type="button" variant="outline" onClick={() => setIsCreateOpen(false)}>
                      Cancel
                    </Button>
                    <Button type="submit" disabled={isCreatingSprint}>
                      {isCreatingSprint ? 'Creating...' : 'Create Sprint'}
                    </Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          )
        }
      />

      {/* Filters */}
      <Card className="mb-6">
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                type="search"
                placeholder="Search sprints..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={projectFilter} onValueChange={setProjectFilter}>
              <SelectTrigger className="w-full sm:w-[200px]">
                <Filter className="w-4 h-4 mr-2" />
                <SelectValue placeholder="All Projects" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Projects</SelectItem>
                {projects.map((project) => (
                  <SelectItem key={project.id} value={project.id}>
                    {project.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder="All Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="ACTIVE">Active</SelectItem>
                <SelectItem value="PLANNED">Planned</SelectItem>
                <SelectItem value="COMPLETED">Completed</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Sprints Grid/List */}
      {filteredSprints.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <Timer className="w-12 h-12 mx-auto mb-3 text-gray-300" />
            <p className="font-medium text-gray-900">No sprints found</p>
            <p className="text-sm text-gray-500 mt-1">
              Try adjusting your search or filters
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredSprints.map((sprint) => {
            const daysLeft = getDaysLeft(sprint.endDate);
            const sprintEnd = typeof sprint.endDate === 'string' ? new Date(sprint.endDate) : sprint.endDate;
            const sprintStart = typeof sprint.startDate === 'string' ? new Date(sprint.startDate) : sprint.startDate;
            const duration = Math.ceil(
              (sprintEnd.getTime() - sprintStart.getTime()) / (1000 * 60 * 60 * 24)
            );
            const daysPassed = duration - daysLeft;
            const progress = sprint.status === 'COMPLETED' ? 100 : Math.max(0, (daysPassed / duration) * 100);

            return (
              <Card
                key={sprint.id}
                onClick={() => handleSprintClick(sprint.id)}
                className="hover:border-primary/40 hover:shadow-[var(--shadow-medium)] hover:scale-[1.01] active:scale-[0.99] transition-all cursor-pointer group"
              >
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-3">
                    <Badge className={getStatusColor(sprint.status)} variant="outline">
                      {sprint.status}
                    </Badge>
                    {sprint.status === 'ACTIVE' && daysLeft <= 2 && (
                      <Badge variant="destructive" className="text-xs">
                        {daysLeft}d left
                      </Badge>
                    )}
                  </div>

                  <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2">
                    {sprint.name}
                  </h3>
                  <p className="text-sm text-gray-600 mb-4">{sprint.projectName}</p>

                  {/* Progress Bar */}
                  {sprint.status !== 'PLANNED' && (
                    <div className="mb-4">
                      <div className="flex items-center justify-between text-xs text-gray-600 mb-1.5">
                        <span>Progress</span>
                        <span>{Math.round(progress)}%</span>
                      </div>
                      <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all ${
                            sprint.status === 'COMPLETED'
                              ? 'bg-green-500'
                              : progress > 80
                              ? 'bg-orange-500'
                              : 'bg-blue-500'
                          }`}
                          style={{ width: `${progress}%` }}
                        />
                      </div>
                    </div>
                  )}

                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2 text-gray-600">
                      <FileText className="w-4 h-4" />
                      <span>{sprint.storyCount} stories</span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-600">
                      <Calendar className="w-4 h-4" />
                      <span>
                        {(typeof sprint.startDate === 'string' ? new Date(sprint.startDate) : sprint.startDate).toLocaleDateString()} -{' '}
                        {(typeof sprint.endDate === 'string' ? new Date(sprint.endDate) : sprint.endDate).toLocaleDateString()}
                      </span>
                    </div>
                    {sprint.status === 'ACTIVE' && (
                      <div className="flex items-center gap-2 text-gray-600">
                        <Clock className="w-4 h-4" />
                        <span>
                          {daysLeft > 0
                            ? `${daysLeft} days remaining`
                            : 'Sprint ended'}
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="mt-4 pt-4 border-t">
                    <p className="text-xs text-gray-500 mb-2">Sprint Goal</p>
                    <p className="text-sm text-gray-900 line-clamp-2">{sprint.goal}</p>
                  </div>

                  <div className="mt-4 flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleSprintClick(sprint.id);
                      }}
                    >
                      View Details
                    </Button>
                    {hasRole(['ADMIN', 'MANAGER']) && sprint.status === 'ACTIVE' && (
                      <Button
                        size="sm"
                        variant="default"
                        className="flex-1"
                        onClick={(e) => initiateComplete(e, sprint.id)}
                      >
                        Complete
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Confirmation Dialog */}
      <AlertDialog
        open={actionState.status === 'CONFIRMING' || actionState.status === 'PROCESSING'}
        onOpenChange={(open) => !open && actionState.status !== 'PROCESSING' && setActionState({ type: null, status: 'IDLE', targetId: null })}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-green-600" />
              Complete Sprint?
            </AlertDialogTitle>
            <AlertDialogDescription>
              This will mark the sprint as completed. Any unfinished stories will be moved back to the backlog.
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={actionState.status === 'PROCESSING'}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => {
                e.preventDefault();
                handleComplete();
              }}
              disabled={actionState.status === 'PROCESSING'}
              className="bg-green-600 hover:bg-green-700"
            >
              {actionState.status === 'PROCESSING' ? 'Completing...' : 'Yes, Complete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Details Drawer */}
      <DetailsDrawer
        isOpen={!!selectedSprint}
        onOpenChange={(open) => !open && closeDrawer()}
        title={selectedSprint?.name || ''}
        subtitle={selectedSprint?.projectName}
        actions={drawerActions}
      >
        {selectedSprint && (
          <div className="space-y-8">
            <div className="space-y-4">
              <h4 className="text-sm font-semibold text-muted-foreground flex items-center gap-2 uppercase tracking-wider">
                <Target className="w-4 h-4" /> Sprint Goal
              </h4>
              <p className="text-base text-foreground leading-relaxed italic">
                "{selectedSprint.goal}"
              </p>
            </div>

            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-2">
                <p className="text-xs font-semibold text-muted-foreground uppercase flex items-center gap-2">
                  <Info className="w-3 h-3" /> Status
                </p>
                <Badge className={getStatusColor(selectedSprint.status)} variant="outline">
                  {selectedSprint.status}
                </Badge>
              </div>
              <div className="space-y-2">
                <p className="text-xs font-semibold text-muted-foreground uppercase flex items-center gap-2">
                  <FileText className="w-3 h-3" /> Stories
                </p>
                <p className="font-bold text-lg">{selectedSprint.storyCount} stories</p>
              </div>
            </div>

            <div className="space-y-4">
              <h4 className="text-sm font-semibold text-muted-foreground flex items-center gap-2 uppercase tracking-wider">
                <Calendar className="w-4 h-4" /> Period
              </h4>
              <div className="grid grid-cols-2 gap-4">
                <div className="p-3 rounded-lg border bg-card/30">
                  <p className="text-[10px] font-bold text-muted-foreground uppercase mb-1">Start</p>
                  <p className="text-sm font-medium">{selectedSprint.startDate instanceof Date ? selectedSprint.startDate.toLocaleDateString() : new Date(selectedSprint.startDate).toLocaleDateString()}</p>
                </div>
                <div className="p-3 rounded-lg border bg-card/30">
                  <p className="text-[10px] font-bold text-muted-foreground uppercase mb-1">End</p>
                  <p className="text-sm font-medium">{selectedSprint.endDate instanceof Date ? selectedSprint.endDate.toLocaleDateString() : new Date(selectedSprint.endDate).toLocaleDateString()}</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </DetailsDrawer>

      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className="sm:max-w-[520px]">
          <DialogHeader>
            <DialogTitle>Edit Sprint</DialogTitle>
            <DialogDescription>
              Update sprint details and schedule.
            </DialogDescription>
          </DialogHeader>
          <form className="space-y-4" onSubmit={handleEditSprint}>
            <div className="space-y-2">
              <Label htmlFor="editSprintName">Sprint Name</Label>
              <Input
                id="editSprintName"
                value={editForm.name}
                onChange={(event) => {
                  setEditForm((previous) => ({ ...previous, name: event.target.value }));
                  if (editErrors.name) {
                    setEditErrors((previous) => ({ ...previous, name: undefined }));
                  }
                }}
                required
              />
              {editErrors.name && <p className="text-xs text-destructive">{editErrors.name}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="editSprintProject">Project</Label>
              <Select
                value={editForm.projectId}
                onValueChange={(value) => {
                  setEditForm((previous) => ({ ...previous, projectId: value }));
                  if (editErrors.projectId) {
                    setEditErrors((previous) => ({ ...previous, projectId: undefined }));
                  }
                }}
              >
                <SelectTrigger id="editSprintProject">
                  <SelectValue placeholder="Select project" />
                </SelectTrigger>
                <SelectContent>
                  {projects.map((project) => (
                    <SelectItem key={project.id} value={project.id}>{project.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {editErrors.projectId && <p className="text-xs text-destructive">{editErrors.projectId}</p>}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="editSprintStartDate">Start Date</Label>
                <Input
                  id="editSprintStartDate"
                  type="date"
                  value={editForm.startDate}
                  onChange={(event) => {
                    setEditForm((previous) => ({ ...previous, startDate: event.target.value }));
                    if (editErrors.startDate) {
                      setEditErrors((previous) => ({ ...previous, startDate: undefined }));
                    }
                  }}
                  required
                />
                {editErrors.startDate && <p className="text-xs text-destructive">{editErrors.startDate}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="editSprintEndDate">End Date</Label>
                <Input
                  id="editSprintEndDate"
                  type="date"
                  value={editForm.endDate}
                  onChange={(event) => {
                    setEditForm((previous) => ({ ...previous, endDate: event.target.value }));
                    if (editErrors.endDate) {
                      setEditErrors((previous) => ({ ...previous, endDate: undefined }));
                    }
                  }}
                  required
                />
                {editErrors.endDate && <p className="text-xs text-destructive">{editErrors.endDate}</p>}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="editSprintStatus">Status</Label>
                <Select
                  value={editForm.status}
                  onValueChange={(value: SprintStatus) => setEditForm((previous) => ({
                    ...previous,
                    status: value,
                  }))}
                >
                  <SelectTrigger id="editSprintStatus">
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="PLANNED">Planned</SelectItem>
                    <SelectItem value="ACTIVE">Active</SelectItem>
                    <SelectItem value="COMPLETED">Completed</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="editSprintVelocity">Velocity</Label>
                <Input
                  id="editSprintVelocity"
                  type="number"
                  min={0}
                  value={editForm.velocity}
                  onChange={(event) => {
                    setEditForm((previous) => ({ ...previous, velocity: event.target.value }));
                    if (editErrors.velocity) {
                      setEditErrors((previous) => ({ ...previous, velocity: undefined }));
                    }
                  }}
                />
                {editErrors.velocity && <p className="text-xs text-destructive">{editErrors.velocity}</p>}
              </div>
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsEditOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={isUpdatingSprint}>
                {isUpdatingSprint ? 'Saving...' : 'Save Changes'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <AlertDialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete sprint?</AlertDialogTitle>
            <AlertDialogDescription>
              This permanently deletes the sprint and cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeletingSprint}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              disabled={isDeletingSprint}
              onClick={(event) => {
                event.preventDefault();
                void handleDeleteSprint();
              }}
            >
              {isDeletingSprint ? 'Deleting...' : 'Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </PageContainer>
  );
}
