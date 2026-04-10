import {
    AlertCircle,
    ArrowLeft,
    Calendar,
    CheckCircle2,
    Clock,
    FileText,
    Settings2,
    Timer,
    TrendingUp,
    Users,
} from 'lucide-react';
import { useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router';
import { toast } from 'sonner';
import { PageContainer } from '../components/ui/PageContainer';
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
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '../components/ui/dialog';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import {
    Tabs,
    TabsContent,
    TabsList,
    TabsTrigger,
} from '../components/ui/tabs';
import { Textarea } from '../components/ui/textarea';
import { useAuth } from '../context/AuthContext';
import { useAppStore } from '../store/useAppStore';

export default function ProjectDetail() {
  const navigate = useNavigate();
  const { projectId } = useParams();
  const { hasRole } = useAuth();
  const { projects, sprints, stories, activities, updateProject, deleteProject } = useAppStore();

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isDeletingProject, setIsDeletingProject] = useState(false);
  const [editErrors, setEditErrors] = useState<{
    name?: string;
  }>({});

  const project = useMemo(() =>
    projects.find((p) => p.id === projectId)
  , [projects, projectId]);

  const [editFormData, setEditFormData] = useState({
    name: project?.name || '',
    description: project?.description || '',
  });

  if (!project) {
    return (
      <PageContainer>
        <div className="text-center py-12">
          <AlertCircle className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
          <p className="text-lg font-medium text-foreground">Project not found</p>
          <Link to="/projects">
            <Button variant="outline" className="mt-4">
              Back to Projects
            </Button>
          </Link>
        </div>
      </PageContainer>
    );
  }

  const projectSprints = sprints.filter((s) => s.projectId === projectId);
  const projectStories = stories.filter((s) => s.projectId === projectId);
  const projectActivities = activities.filter((a) =>
    a.entityId === projectId ||
    projectSprints.some(sprint => sprint.id === a.entityId) ||
    projectStories.some(story => story.id === a.entityId)
  );

  const completedStories = projectStories.filter((s) => s.status === 'DONE').length;
  const totalStoryPoints = projectStories.reduce((sum, s) => sum + s.storyPoints, 0);
  const completedStoryPoints = projectStories
    .filter((s) => s.status === 'DONE')
    .reduce((sum, s) => sum + s.storyPoints, 0);

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const name = editFormData.name.trim();
    const nextErrors: { name?: string } = {};
    if (name.length < 3) {
      nextErrors.name = 'Project name must be at least 3 characters.';
    }

    setEditErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) {
      return;
    }

    try {
      await updateProject(project.id, {
        name,
        description: editFormData.description.trim(),
      });
      setIsEditModalOpen(false);
      toast.success('Project updated successfully');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to update project.';
      toast.error(message);
    }
  };

  const handleDeleteProject = async () => {
    setIsDeletingProject(true);

    try {
      await deleteProject(project.id);
      toast.success('Project deleted successfully.');
      navigate('/projects');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to delete project.';
      toast.error(message);
    } finally {
      setIsDeletingProject(false);
      setIsDeleteDialogOpen(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return 'bg-green-100 text-green-700 border-green-200';
      case 'PLANNING':
        return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'ARCHIVED':
        return 'bg-gray-100 text-gray-700 border-gray-200';
      default:
        return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  return (
    <PageContainer>
      <div className="mb-6">
        <Link to="/projects">
          <Button variant="ghost" size="sm" className="gap-2 mb-4 hover:bg-secondary">
            <ArrowLeft className="w-4 h-4" />
            Back to Projects
          </Button>
        </Link>

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold tracking-tight">{project.name}</h1>
              <Badge className={getStatusColor(project.status)} variant="outline">
                {project.status}
              </Badge>
            </div>
            <p className="text-muted-foreground max-w-2xl">{project.description}</p>
          </div>

          {hasRole(['ADMIN', 'MANAGER']) && (
            <div className="flex items-center gap-2">
              <Button
                className="gap-2"
                onClick={() => {
                  setEditFormData({
                    name: project.name,
                    description: project.description,
                  });
                  setEditErrors({});
                  setIsEditModalOpen(true);
                }}
              >
                <Settings2 className="w-4 h-4" />
                Edit Project
              </Button>
              {hasRole(['ADMIN']) && (
                <Button variant="destructive" onClick={() => setIsDeleteDialogOpen(true)}>
                  Delete Project
                </Button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[
          { label: 'Sprints', value: projectSprints.length, icon: Timer, color: 'text-blue-600', bg: 'bg-blue-100' },
          { label: 'Stories', value: projectStories.length, icon: FileText, color: 'text-purple-600', bg: 'bg-purple-100' },
          {
            label: 'Completion',
            value: `${Math.round((completedStories / (projectStories.length || 1)) * 100)}%`,
            icon: TrendingUp,
            color: 'text-green-600',
            bg: 'bg-green-100'
          },
          {
            label: 'Story Points',
            value: `${completedStoryPoints}/${totalStoryPoints}`,
            icon: CheckCircle2,
            color: 'text-orange-600',
            bg: 'bg-orange-100'
          },
        ].map((stat, i) => (
          <Card key={i}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-1">{stat.label}</p>
                  <p className="text-2xl font-bold">{stat.value}</p>
                </div>
                <div className={`w-12 h-12 ${stat.bg} rounded-xl flex items-center justify-center`}>
                  <stat.icon className={`w-6 h-6 ${stat.color}`} />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="bg-background border-b rounded-none w-full justify-start h-auto p-0 gap-6">
          <TabsTrigger value="overview" className="data-[state=active]:border-primary border-b-2 border-transparent rounded-none px-2 pb-2 pt-0 h-10 bg-transparent shadow-none">Overview</TabsTrigger>
          <TabsTrigger value="sprints" className="data-[state=active]:border-primary border-b-2 border-transparent rounded-none px-2 pb-2 pt-0 h-10 bg-transparent shadow-none">Sprints</TabsTrigger>
          <TabsTrigger value="stories" className="data-[state=active]:border-primary border-b-2 border-transparent rounded-none px-2 pb-2 pt-0 h-10 bg-transparent shadow-none">Stories</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-base font-semibold">Project Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-1">
                <div className="flex items-center justify-between py-3 border-b border-border/50">
                  <span className="text-sm text-muted-foreground">Created</span>
                  <span className="text-sm font-medium flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-muted-foreground" />
                    {new Date(project.createdAt).toLocaleDateString()}
                  </span>
                </div>
                <div className="flex items-center justify-between py-3 border-b border-border/50">
                  <span className="text-sm text-muted-foreground">Team Members</span>
                  <span className="text-sm font-medium flex items-center gap-2">
                    <Users className="w-4 h-4 text-muted-foreground" />
                    {project.memberCount} members
                  </span>
                </div>
                <div className="flex items-center justify-between py-3 border-b border-border/50">
                  <span className="text-sm text-muted-foreground">Sprints Finished</span>
                  <span className="text-sm font-medium">{projectSprints.filter(s => s.status === 'COMPLETED').length} / {projectSprints.length}</span>
                </div>
                <div className="flex items-center justify-between py-3">
                  <span className="text-sm text-muted-foreground">Active Stories</span>
                  <span className="text-sm font-medium">{projectStories.filter(s => s.status !== 'DONE').length} stories</span>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-base font-semibold">Recent Activity</CardTitle>
              </CardHeader>
              <CardContent>
                {projectActivities.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground text-sm">
                    No recent activity
                  </div>
                ) : (
                  <div className="space-y-6">
                    {projectActivities.slice(0, 5).map((activity) => (
                      <div key={activity.id} className="flex gap-3">
                        <Avatar className="w-8 h-8 flex-shrink-0">
                          <AvatarImage src={activity.userAvatar} />
                          <AvatarFallback>{activity.userName.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm">
                            <span className="font-semibold">{activity.userName}</span>{' '}
                            <span className="text-muted-foreground">{activity.action}</span>{' '}
                            <span className="font-medium">{activity.entityName}</span>
                          </p>
                          <p className="text-[11px] text-muted-foreground mt-1 flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {getTimeAgo(activity.timestamp)}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="sprints">
          <div className="grid md:grid-cols-2 gap-4">
            {projectSprints.map((sprint) => {
              const daysLeft = Math.ceil(
                (new Date(sprint.endDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
              );
              return (
                <Card key={sprint.id} className="group hover:border-primary/50 transition-colors">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        <h4 className="font-semibold group-hover:text-primary transition-colors">{sprint.name}</h4>
                        <p className="text-sm text-muted-foreground mt-1 line-clamp-1">{sprint.goal}</p>
                      </div>
                      <Badge variant="outline" className={sprint.status === 'ACTIVE' ? 'bg-green-50 text-green-700' : ''}>
                        {sprint.status}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-4 text-xs text-muted-foreground mt-4 pt-4 border-t">
                      <span className="flex items-center gap-1.5">
                        <FileText className="w-3.5 h-3.5" />
                        {sprint.storyCount} stories
                      </span>
                      <span className="flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5" />
                        {new Date(sprint.startDate).toLocaleDateString()} - {new Date(sprint.endDate).toLocaleDateString()}
                      </span>
                      {sprint.status === 'ACTIVE' && (
                        <span className="flex items-center gap-1.5 font-medium text-foreground">
                          <Clock className="w-3.5 h-3.5 text-orange-500" />
                          {daysLeft}d left
                        </span>
                      )}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>

        <TabsContent value="stories">
          <div className="space-y-3">
            {projectStories.map((story) => (
              <Card key={story.id} className="hover:bg-accent/50 transition-colors cursor-pointer">
                <CardContent className="p-4 flex items-center justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-medium truncate">{story.title}</h4>
                      <Badge variant="outline" className="text-[10px] uppercase font-bold tracking-tight">
                        {story.priority}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-3">
                      <Badge variant="secondary" className="text-[10px]">
                        {story.status.replace('_', ' ')}
                      </Badge>
                      <span className="text-xs text-muted-foreground font-medium">{story.storyPoints} pts</span>
                    </div>
                  </div>
                  {story.assigneeName && (
                    <div className="flex items-center gap-2 shrink-0 border-l pl-4">
                      <span className="text-xs text-muted-foreground hidden sm:block">{story.assigneeName}</span>
                      <Avatar className="w-7 h-7">
                        <AvatarImage src={story.assigneeAvatar} />
                        <AvatarFallback className="text-[10px]">{story.assigneeName.charAt(0)}</AvatarFallback>
                      </Avatar>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>

      {/* Edit Project Dialog */}
      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Edit Project</DialogTitle>
            <DialogDescription>
              Update the project details and visibility. These changes will reflect across all sprints and stories.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleEditSubmit} className="space-y-6 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">Project Name</Label>
              <Input
                id="name"
                value={editFormData.name}
                onChange={(e) => {
                  setEditFormData({ ...editFormData, name: e.target.value });
                  if (editErrors.name) {
                    setEditErrors({});
                  }
                }}
                placeholder="e.g., Mobile App Redesign"
                required
              />
              {editErrors.name && (
                <p className="text-xs text-destructive">{editErrors.name}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={editFormData.description}
                onChange={(e) => setEditFormData({ ...editFormData, description: e.target.value })}
                placeholder="Briefly describe the project goals..."
                className="min-h-[100px]"
                required
              />
            </div>
            <DialogFooter className="pt-4 border-t">
              <Button type="button" variant="outline" onClick={() => setIsEditModalOpen(false)}>
                Cancel
              </Button>
              <Button type="submit">Save Changes</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete project?</AlertDialogTitle>
            <AlertDialogDescription>
              This permanently deletes the project and cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeletingProject}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              disabled={isDeletingProject}
              onClick={(event) => {
                event.preventDefault();
                void handleDeleteProject();
              }}
            >
              {isDeletingProject ? 'Deleting...' : 'Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </PageContainer>
  );
}

function getTimeAgo(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return d.toLocaleDateString();
}
