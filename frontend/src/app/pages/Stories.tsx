import { Calendar, Filter, GripVertical, Info, Plus, Search, Tag, User } from 'lucide-react';
import { useMemo, useState } from 'react';
import { DndProvider, useDrag, useDrop } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { useSearchParams } from 'react-router';
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
    AlertDialogTitle,
} from '../components/ui/alert-dialog';
import { Avatar, AvatarFallback, AvatarImage } from '../components/ui/avatar';
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
import { Textarea } from '../components/ui/textarea';
import { useAuth } from '../context/AuthContext';
import { useAppStore } from '../store/useAppStore';
import { Story, StoryStatus } from '../types';

const COLUMN_CONFIG: { status: StoryStatus; title: string; color: string; bgClass: string; borderClass: string }[] = [
  { status: 'BACKLOG', title: 'Backlog', color: 'bg-gray-500', bgClass: 'bg-gray-50/80', borderClass: 'border-gray-200' },
  { status: 'IN_PROGRESS', title: 'In Progress', color: 'bg-blue-500', bgClass: 'bg-blue-50/50', borderClass: 'border-blue-200' },
  { status: 'IN_REVIEW', title: 'In Review', color: 'bg-purple-500', bgClass: 'bg-purple-50/50', borderClass: 'border-purple-200' },
  { status: 'DONE', title: 'Done', color: 'bg-green-500', bgClass: 'bg-green-50/50', borderClass: 'border-green-200' },
];

interface StoryCardProps {
  story: Story;
  onClick: (storyId: string) => void;
}

function StoryCard({ story, onClick }: StoryCardProps) {
  const [{ isDragging }, drag] = useDrag({
    type: 'STORY',
    item: { id: story.id, status: story.status },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  });

  const getPriorityColor = (priority: Story['priority']) => {
    switch (priority) {
      case 'CRITICAL':
        return 'bg-red-50 text-red-700 border-red-200 ring-1 ring-red-100';
      case 'HIGH':
        return 'bg-orange-50 text-orange-700 border-orange-200 ring-1 ring-orange-100';
      case 'MEDIUM':
        return 'bg-yellow-50 text-yellow-700 border-yellow-200 ring-1 ring-yellow-100';
      case 'LOW':
        return 'bg-gray-50 text-gray-600 border-gray-200';
    }
  };

  return (
    <div
      ref={drag}
      onClick={() => onClick(story.id)}
      className={`bg-card rounded-lg border shadow-[var(--shadow-soft)] p-3.5 cursor-pointer hover:shadow-[var(--shadow-medium)] hover:border-primary/40 hover:scale-[1.01] active:scale-[0.98] transition-all duration-200 group ${
        isDragging ? 'opacity-50 rotate-2' : ''
      }`}
    >
      <div className="flex items-start gap-2 mb-3">
        <GripVertical className="w-4 h-4 text-muted-foreground/40 group-hover:text-muted-foreground flex-shrink-0 mt-0.5 transition-colors" />
        <h4 className="flex-1 font-medium text-sm text-foreground line-clamp-3 leading-snug">
          {story.title}
        </h4>
      </div>

      <div className="flex items-center gap-2 flex-wrap mb-3">
        <Badge variant="outline" className={`text-xs font-semibold ${getPriorityColor(story.priority)}`}>
          {story.priority}
        </Badge>
        <span className="text-xs text-muted-foreground font-semibold px-2 py-0.5 bg-muted rounded">{story.storyPoints} pts</span>
      </div>

      {story.assigneeName && (
        <div className="flex items-center gap-2 pt-2 border-t border-border/50">
          <Avatar className="w-6 h-6 border">
            <AvatarImage src={story.assigneeAvatar} />
            <AvatarFallback className="text-xs">{story.assigneeName.charAt(0)}</AvatarFallback>
          </Avatar>
          <span className="text-xs text-muted-foreground font-medium truncate">{story.assigneeName}</span>
        </div>
      )}
    </div>
  );
}

interface ColumnProps {
  status: StoryStatus;
  title: string;
  color: string;
  bgClass: string;
  borderClass: string;
  stories: Story[];
  onMove: (storyId: string, newStatus: StoryStatus) => void;
  onStoryClick: (storyId: string) => void;
}

function Column({ status, title, color, bgClass, borderClass, stories, onMove, onStoryClick }: ColumnProps) {
  const [{ isOver }, drop] = useDrop({
    accept: 'STORY',
    drop: (item: { id: string; status: StoryStatus }) => {
      if (item.status !== status) {
        onMove(item.id, status);
      }
    },
    collect: (monitor) => ({
      isOver: monitor.isOver(),
    }),
  });

  const totalPoints = stories.reduce((sum, story) => sum + story.storyPoints, 0);

  return (
    <div className="flex-shrink-0 w-80">
      <div className={`rounded-xl border-2 ${borderClass} ${bgClass} backdrop-blur-sm p-4 h-full transition-all shadow-[var(--shadow-soft)]`}>
        {/* Column Header */}
        <div className="flex items-center justify-between mb-4 pb-3 border-b border-border">
          <div className="flex items-center gap-2.5">
            <div className={`w-2 h-2 rounded-full ${color} shadow-sm`} />
            <h3 className="font-semibold text-sm text-foreground tracking-tight">{title}</h3>
            <Badge variant="secondary" className="text-xs font-semibold px-2">
              {stories.length}
            </Badge>
          </div>
          <span className="text-xs text-muted-foreground font-medium">{totalPoints} pts</span>
        </div>

        {/* Drop Zone */}
        <div
          ref={drop}
          className={`space-y-3 min-h-[500px] rounded-lg transition-all duration-200 ${
            isOver ? 'bg-primary/5 ring-2 ring-primary/20 p-2' : ''
          }`}
        >
          {stories.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
              <div className={`w-12 h-12 rounded-full ${color.replace('500', '100')} flex items-center justify-center mb-3`}>
                <div className={`w-6 h-6 rounded-full ${color.replace('500', '200')}`} />
              </div>
              <p className="text-xs font-medium">Drop stories here</p>
            </div>
          ) : (
            stories.map((story) => (
              <StoryCard
                key={story.id}
                story={story}
                onClick={onStoryClick}
              />
            ))
          )}
        </div>
      </div>
    </div>
  );
}

export default function Stories() {
  const { hasRole } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const {
    stories,
    updateStoryStatus,
    createStory,
    updateStory,
    deleteStory,
    projects,
    sprints,
    users,
  } = useAppStore();

  const [searchQuery, setSearchQuery] = useState('');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isCreatingStory, setIsCreatingStory] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isUpdatingStory, setIsUpdatingStory] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [isDeletingStory, setIsDeletingStory] = useState(false);
  const [createForm, setCreateForm] = useState({
    title: '',
    description: '',
    projectId: '',
    sprintId: '__none__',
    priority: 'MEDIUM' as Story['priority'],
    status: 'BACKLOG' as StoryStatus,
    storyPoints: '',
    assigneeEmail: '__none__',
  });
  const [editForm, setEditForm] = useState({
    id: '',
    title: '',
    description: '',
    sprintId: '__none__',
    priority: 'MEDIUM' as Story['priority'],
    status: 'BACKLOG' as StoryStatus,
    storyPoints: '',
    assigneeEmail: '__none__',
  });
  const [createErrors, setCreateErrors] = useState<{
    title?: string;
    projectId?: string;
    storyPoints?: string;
  }>({});
  const [editErrors, setEditErrors] = useState<{
    title?: string;
    storyPoints?: string;
  }>({});

  const selectedStoryId = searchParams.get('storyId');
  const activeSprintId = searchParams.get('sprintId');

  const selectedStory = useMemo(() =>
    stories.find((s) => s.id === selectedStoryId) || null
  , [stories, selectedStoryId]);

  const resetCreateForm = () => {
    setCreateForm({
      title: '',
      description: '',
      projectId: projects[0]?.id || '',
      sprintId: '__none__',
      priority: 'MEDIUM',
      status: 'BACKLOG',
      storyPoints: '',
      assigneeEmail: '__none__',
    });
    setCreateErrors({});
  };

  const validateStoryForm = (form: {
    title: string;
    storyPoints: string;
  }) => {
    const errors: {
      title?: string;
      storyPoints?: string;
    } = {};

    if (!form.title.trim()) {
      errors.title = 'Story title is required.';
    }

    if (form.storyPoints.trim().length > 0) {
      const points = Number(form.storyPoints);
      if (!Number.isFinite(points) || points < 0) {
        errors.storyPoints = 'Story points must be a non-negative number.';
      }
    }

    return errors;
  };

  const handleStoryClick = (id: string) => {
    setSearchParams({ storyId: id });
  };

  const closeDrawer = () => {
    setSearchParams({});
  };

  const handleMove = (storyId: string, newStatus: StoryStatus) => {
    if (!hasRole(['ADMIN', 'MANAGER'])) {
      toast.error('Only managers and admins can update story status.');
      return;
    }

    void updateStoryStatus(storyId, newStatus)
      .then(() => {
        toast.success(`Story status updated to ${newStatus.replace('_', ' ')}`);
      })
      .catch((error) => {
        const message = error instanceof Error ? error.message : 'Failed to update story status.';
        toast.error(message);
      });
  };

  const availableSprints = useMemo(
    () => sprints.filter((sprint) => sprint.projectId === createForm.projectId),
    [createForm.projectId, sprints]
  );

  const availableEditSprints = useMemo(() => {
    if (!selectedStory) {
      return [];
    }

    return sprints.filter((sprint) => sprint.projectId === selectedStory.projectId);
  }, [selectedStory, sprints]);

  const handleCreateStory = async (event: React.FormEvent) => {
    event.preventDefault();

    const validationErrors = {
      ...validateStoryForm({
        title: createForm.title,
        storyPoints: createForm.storyPoints,
      }),
      projectId: createForm.projectId ? undefined : 'Project is required.',
    };
    setCreateErrors(validationErrors);
    if (Object.values(validationErrors).some(Boolean)) {
      return;
    }

    if (!createForm.projectId) {
      toast.error('Please select a project.');
      return;
    }

    const parsedStoryPoints = createForm.storyPoints.trim().length > 0
      ? Number(createForm.storyPoints)
      : undefined;

    setIsCreatingStory(true);
    try {
      await createStory({
        title: createForm.title.trim(),
        description: createForm.description.trim(),
        status: createForm.status,
        priority: createForm.priority,
        storyPoints: parsedStoryPoints,
        projectId: createForm.projectId,
        sprintId: createForm.sprintId === '__none__' ? undefined : createForm.sprintId,
        assigneeEmail: createForm.assigneeEmail === '__none__' ? undefined : createForm.assigneeEmail,
      });

      toast.success('Story created successfully.');
      setIsCreateOpen(false);
      resetCreateForm();
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to create story.';
      toast.error(message);
    } finally {
      setIsCreatingStory(false);
    }
  };

  const openEditForSelectedStory = () => {
    if (!selectedStory) {
      return;
    }

    setEditForm({
      id: selectedStory.id,
      title: selectedStory.title,
      description: selectedStory.description,
      sprintId: selectedStory.sprintId || '__none__',
      priority: selectedStory.priority,
      status: selectedStory.status,
      storyPoints: String(selectedStory.storyPoints),
      assigneeEmail:
        users.find((user) => user.id === selectedStory.assigneeId)?.email || '__none__',
    });
    setEditErrors({});
    setIsEditOpen(true);
  };

  const handleEditStory = async (event: React.FormEvent) => {
    event.preventDefault();

    const validationErrors = validateStoryForm({
      title: editForm.title,
      storyPoints: editForm.storyPoints,
    });
    setEditErrors(validationErrors);
    if (Object.keys(validationErrors).length > 0) {
      return;
    }

    const parsedStoryPoints = editForm.storyPoints.trim().length > 0
      ? Number(editForm.storyPoints)
      : undefined;

    setIsUpdatingStory(true);
    try {
      await updateStory({
        id: editForm.id,
        title: editForm.title.trim(),
        description: editForm.description.trim(),
        status: editForm.status,
        priority: editForm.priority,
        storyPoints: parsedStoryPoints,
        sprintId: editForm.sprintId === '__none__' ? undefined : editForm.sprintId,
        assigneeEmail: editForm.assigneeEmail === '__none__' ? undefined : editForm.assigneeEmail,
      });

      toast.success('Story updated successfully.');
      setIsEditOpen(false);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to update story.';
      toast.error(message);
    } finally {
      setIsUpdatingStory(false);
    }
  };

  const handleDeleteStory = async () => {
    if (!selectedStory) {
      return;
    }

    setIsDeletingStory(true);
    try {
      await deleteStory(selectedStory.id);
      toast.success('Story deleted successfully.');
      setIsDeleteOpen(false);
      closeDrawer();
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to delete story.';
      toast.error(message);
    } finally {
      setIsDeletingStory(false);
    }
  };

  // Filter stories based on URL sprintId and other filters
  const filteredStories = useMemo(() => {
    return stories.filter((story: Story) => {
      const matchesSprint = !activeSprintId || story.sprintId === activeSprintId;
      const matchesSearch = story.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           story.id.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesPriority = priorityFilter === 'all' || story.priority === priorityFilter;
      return matchesSprint && matchesSearch && matchesPriority;
    });
  }, [stories, activeSprintId, searchQuery, priorityFilter]);

  const getStoriesByStatus = (status: StoryStatus) => {
    return filteredStories.filter((story: Story) => story.status === status);
  };

  const drawerActions = selectedStory
    ? [
        ...(hasRole(['ADMIN', 'MANAGER'])
          ? [
              {
                label: 'Edit Story',
                onClick: openEditForSelectedStory,
                variant: 'outline' as const,
              },
              {
                label: 'Move to Progress',
                onClick: () => handleMove(selectedStory.id, 'IN_PROGRESS'),
                variant: 'default' as const,
              },
            ]
          : []),
        ...(hasRole(['ADMIN'])
          ? [
              {
                label: 'Delete Story',
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
    <DndProvider backend={HTML5Backend}>
      <PageContainer variant="full">
        <PageHeader
          title="Stories"
          subtitle={activeSprintId ? `Sprint Board: ${activeSprintId}` : "All project stories and tasks"}
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
                    New Story
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[560px]">
                  <DialogHeader>
                    <DialogTitle>Create Story</DialogTitle>
                    <DialogDescription>
                      Add a story to a project backlog or active sprint.
                    </DialogDescription>
                  </DialogHeader>
                  <form className="space-y-4" onSubmit={handleCreateStory}>
                    <div className="space-y-2">
                      <Label htmlFor="storyTitle">Title</Label>
                      <Input
                        id="storyTitle"
                        value={createForm.title}
                        onChange={(event) => {
                          setCreateForm((previous) => ({
                            ...previous,
                            title: event.target.value,
                          }));
                          if (createErrors.title) {
                            setCreateErrors((previous) => ({ ...previous, title: undefined }));
                          }
                        }}
                        placeholder="Implement dashboard widgets"
                        required
                      />
                      {createErrors.title && <p className="text-xs text-destructive">{createErrors.title}</p>}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="storyDescription">Description</Label>
                      <Textarea
                        id="storyDescription"
                        value={createForm.description}
                        onChange={(event) => setCreateForm((previous) => ({
                          ...previous,
                          description: event.target.value,
                        }))}
                        placeholder="Add acceptance criteria and implementation notes"
                        className="min-h-[96px]"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="storyProject">Project</Label>
                        <Select
                          value={createForm.projectId}
                          onValueChange={(value) => {
                            setCreateForm((previous) => ({
                              ...previous,
                              projectId: value,
                              sprintId: '__none__',
                            }));
                            if (createErrors.projectId) {
                              setCreateErrors((previous) => ({ ...previous, projectId: undefined }));
                            }
                          }}
                        >
                          <SelectTrigger id="storyProject">
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

                      <div className="space-y-2">
                        <Label htmlFor="storySprint">Sprint</Label>
                        <Select
                          value={createForm.sprintId}
                          onValueChange={(value) => setCreateForm((previous) => ({
                            ...previous,
                            sprintId: value,
                          }))}
                        >
                          <SelectTrigger id="storySprint">
                            <SelectValue placeholder="Backlog (no sprint)" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="__none__">Backlog (no sprint)</SelectItem>
                            {availableSprints.map((sprint) => (
                              <SelectItem key={sprint.id} value={sprint.id}>{sprint.name}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="storyPriority">Priority</Label>
                        <Select
                          value={createForm.priority}
                          onValueChange={(value: Story['priority']) => setCreateForm((previous) => ({
                            ...previous,
                            priority: value,
                          }))}
                        >
                          <SelectTrigger id="storyPriority"><SelectValue /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="LOW">Low</SelectItem>
                            <SelectItem value="MEDIUM">Medium</SelectItem>
                            <SelectItem value="HIGH">High</SelectItem>
                            <SelectItem value="CRITICAL">Critical</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="storyStatus">Status</Label>
                        <Select
                          value={createForm.status}
                          onValueChange={(value: StoryStatus) => setCreateForm((previous) => ({
                            ...previous,
                            status: value,
                          }))}
                        >
                          <SelectTrigger id="storyStatus"><SelectValue /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="BACKLOG">Backlog</SelectItem>
                            <SelectItem value="IN_PROGRESS">In Progress</SelectItem>
                            <SelectItem value="IN_REVIEW">In Review</SelectItem>
                            <SelectItem value="DONE">Done</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="storyPoints">Points</Label>
                        <Input
                          id="storyPoints"
                          type="number"
                          min={0}
                          value={createForm.storyPoints}
                          onChange={(event) => {
                            setCreateForm((previous) => ({
                              ...previous,
                              storyPoints: event.target.value,
                            }));
                            if (createErrors.storyPoints) {
                              setCreateErrors((previous) => ({ ...previous, storyPoints: undefined }));
                            }
                          }}
                          placeholder="3"
                        />
                        {createErrors.storyPoints && <p className="text-xs text-destructive">{createErrors.storyPoints}</p>}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="storyAssignee">Assignee</Label>
                      <Select
                        value={createForm.assigneeEmail}
                        onValueChange={(value) => setCreateForm((previous) => ({
                          ...previous,
                          assigneeEmail: value,
                        }))}
                      >
                        <SelectTrigger id="storyAssignee">
                          <SelectValue placeholder="Unassigned" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="__none__">Unassigned</SelectItem>
                          {users.map((user) => (
                            <SelectItem key={user.id} value={user.email}>{user.name} ({user.email})</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <DialogFooter>
                      <Button type="button" variant="outline" onClick={() => setIsCreateOpen(false)}>
                        Cancel
                      </Button>
                      <Button type="submit" disabled={isCreatingStory}>
                        {isCreatingStory ? 'Creating...' : 'Create Story'}
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
                  placeholder="Search stories..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={priorityFilter} onValueChange={setPriorityFilter}>
                <SelectTrigger className="w-full sm:w-[180px]">
                  <Filter className="w-4 h-4 mr-2" />
                  <SelectValue placeholder="All Priorities" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Priorities</SelectItem>
                  <SelectItem value="CRITICAL">Critical</SelectItem>
                  <SelectItem value="HIGH">High</SelectItem>
                  <SelectItem value="MEDIUM">Medium</SelectItem>
                  <SelectItem value="LOW">Low</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Kanban Board */}
        <div className="overflow-x-auto pb-4 -mx-4 px-4">
          <div className="flex gap-4 min-w-max">
            {COLUMN_CONFIG.map((column) => (
              <Column
                key={column.status}
                status={column.status}
                title={column.title}
                color={column.color}
                bgClass={column.bgClass}
                borderClass={column.borderClass}
                stories={getStoriesByStatus(column.status)}
                onMove={handleMove}
                onStoryClick={handleStoryClick}
              />
            ))}
          </div>
        </div>

        {/* Detail Drawer */}
        <DetailsDrawer
          isOpen={!!selectedStory}
          onOpenChange={(open) => !open && closeDrawer()}
          title={selectedStory?.title || ''}
          subtitle={`Story ID: ${selectedStory?.id}`}
          actions={drawerActions}
        >
          {selectedStory && (
            <div className="space-y-8">
              <div className="space-y-4">
                <h4 className="text-sm font-semibold text-muted-foreground flex items-center gap-2 uppercase tracking-wider">
                  <Info className="w-4 h-4" /> Description
                </h4>
                <p className="text-base text-foreground leading-relaxed">
                  Project documentation and initial mockup reviews for the {selectedStory.title}.
                  All requirements have been gathered and are ready for implementation stages.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <p className="text-xs font-semibold text-muted-foreground uppercase flex items-center gap-2">
                    <Tag className="w-3 h-3" /> Priority
                  </p>
                  <Badge variant="outline" className={`font-semibold`}>
                    {selectedStory.priority}
                  </Badge>
                </div>
                <div className="space-y-2">
                  <p className="text-xs font-semibold text-muted-foreground uppercase flex items-center gap-2">
                    <Info className="w-3 h-3" /> Points
                  </p>
                  <p className="font-bold text-lg">{selectedStory.storyPoints} pts</p>
                </div>
              </div>

              <div className="space-y-4">
                <h4 className="text-sm font-semibold text-muted-foreground flex items-center gap-2 uppercase tracking-wider">
                  <User className="w-4 h-4" /> Assignee
                </h4>
                <div className="flex items-center gap-3 p-3 rounded-lg border bg-card/30">
                  <Avatar className="w-10 h-10 border">
                    <AvatarImage src={selectedStory.assigneeAvatar} />
                    <AvatarFallback>{selectedStory.assigneeName?.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-semibold text-sm">{selectedStory.assigneeName}</p>
                    <p className="text-xs text-muted-foreground">Software Engineer</p>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h4 className="text-sm font-semibold text-muted-foreground flex items-center gap-2 uppercase tracking-wider">
                  <Calendar className="w-4 h-4" /> Timeline
                </h4>
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-3 rounded-lg border bg-card/30">
                    <p className="text-[10px] font-bold text-muted-foreground uppercase mb-1">Created</p>
                    <p className="text-sm font-medium">Apr 5, 2026</p>
                  </div>
                  <div className="p-3 rounded-lg border bg-card/30">
                    <p className="text-[10px] font-bold text-muted-foreground uppercase mb-1">Updated</p>
                    <p className="text-sm font-medium">2 hours ago</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </DetailsDrawer>

        <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
          <DialogContent className="sm:max-w-[560px]">
            <DialogHeader>
              <DialogTitle>Edit Story</DialogTitle>
              <DialogDescription>
                Update story details and assignment.
              </DialogDescription>
            </DialogHeader>
            <form className="space-y-4" onSubmit={handleEditStory}>
              <div className="space-y-2">
                <Label htmlFor="editStoryTitle">Title</Label>
                <Input
                  id="editStoryTitle"
                  value={editForm.title}
                  onChange={(event) => {
                    setEditForm((previous) => ({ ...previous, title: event.target.value }));
                    if (editErrors.title) {
                      setEditErrors((previous) => ({ ...previous, title: undefined }));
                    }
                  }}
                  required
                />
                {editErrors.title && <p className="text-xs text-destructive">{editErrors.title}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="editStoryDescription">Description</Label>
                <Textarea
                  id="editStoryDescription"
                  value={editForm.description}
                  onChange={(event) => setEditForm((previous) => ({
                    ...previous,
                    description: event.target.value,
                  }))}
                  className="min-h-[96px]"
                />
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="editStoryPriority">Priority</Label>
                  <Select
                    value={editForm.priority}
                    onValueChange={(value: Story['priority']) => setEditForm((previous) => ({
                      ...previous,
                      priority: value,
                    }))}
                  >
                    <SelectTrigger id="editStoryPriority"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="LOW">Low</SelectItem>
                      <SelectItem value="MEDIUM">Medium</SelectItem>
                      <SelectItem value="HIGH">High</SelectItem>
                      <SelectItem value="CRITICAL">Critical</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="editStoryStatus">Status</Label>
                  <Select
                    value={editForm.status}
                    onValueChange={(value: StoryStatus) => setEditForm((previous) => ({
                      ...previous,
                      status: value,
                    }))}
                  >
                    <SelectTrigger id="editStoryStatus"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="BACKLOG">Backlog</SelectItem>
                      <SelectItem value="IN_PROGRESS">In Progress</SelectItem>
                      <SelectItem value="IN_REVIEW">In Review</SelectItem>
                      <SelectItem value="DONE">Done</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="editStoryPoints">Points</Label>
                  <Input
                    id="editStoryPoints"
                    type="number"
                    min={0}
                    value={editForm.storyPoints}
                    onChange={(event) => {
                      setEditForm((previous) => ({ ...previous, storyPoints: event.target.value }));
                      if (editErrors.storyPoints) {
                        setEditErrors((previous) => ({ ...previous, storyPoints: undefined }));
                      }
                    }}
                  />
                  {editErrors.storyPoints && <p className="text-xs text-destructive">{editErrors.storyPoints}</p>}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="editStorySprint">Sprint</Label>
                  <Select
                    value={editForm.sprintId}
                    onValueChange={(value) => setEditForm((previous) => ({ ...previous, sprintId: value }))}
                  >
                    <SelectTrigger id="editStorySprint">
                      <SelectValue placeholder="Backlog (no sprint)" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="__none__">Backlog (no sprint)</SelectItem>
                      {availableEditSprints.map((sprint) => (
                        <SelectItem key={sprint.id} value={sprint.id}>{sprint.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="editStoryAssignee">Assignee</Label>
                  <Select
                    value={editForm.assigneeEmail}
                    onValueChange={(value) => setEditForm((previous) => ({ ...previous, assigneeEmail: value }))}
                  >
                    <SelectTrigger id="editStoryAssignee">
                      <SelectValue placeholder="Unassigned" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="__none__">Unassigned</SelectItem>
                      {users.map((user) => (
                        <SelectItem key={user.id} value={user.email}>{user.name} ({user.email})</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsEditOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={isUpdatingStory}>
                  {isUpdatingStory ? 'Saving...' : 'Save Changes'}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>

        <AlertDialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete story?</AlertDialogTitle>
              <AlertDialogDescription>
                This permanently deletes the story and cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel disabled={isDeletingStory}>Cancel</AlertDialogCancel>
              <AlertDialogAction
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                disabled={isDeletingStory}
                onClick={(event) => {
                  event.preventDefault();
                  void handleDeleteStory();
                }}
              >
                {isDeletingStory ? 'Deleting...' : 'Delete'}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        {/* Stats Summary */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
          {COLUMN_CONFIG.map((column) => {
            const stories = getStoriesByStatus(column.status);
            const totalPoints = stories.reduce((sum: number, s: Story) => sum + s.storyPoints, 0);
            return (
              <Card key={column.status}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">{column.title}</p>
                      <p className="text-2xl font-bold text-gray-900 mt-1">{stories.length}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-gray-500">Story Points</p>
                      <p className="text-lg font-semibold text-gray-900 mt-1">{totalPoints}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </PageContainer>
    </DndProvider>
  );
}
