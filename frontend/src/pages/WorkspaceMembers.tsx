import type React from 'react';
import { useState, useEffect, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { apiClient, getApiErrorMessage } from '../api/axios';
import { useAuth } from '../context/AuthContext';
import type { Workspace, WorkspaceMember, WorkspaceRole } from '../types';
import { Card, CardHeader, CardBody } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { ConfirmDialog } from '../components/ui/ConfirmDialog';
import { UserPlus, ArrowLeft, Trash2 } from 'lucide-react';
import { toast } from 'react-hot-toast';

const ROLES: WorkspaceRole[] = ['ADMIN', 'MEMBER', 'VIEWER'];

export const WorkspaceMembers: React.FC = () => {
  const { workspaceId } = useParams<{ workspaceId: string }>();
  const { user } = useAuth();
  const [workspace, setWorkspace] = useState<Workspace | null>(null);
  const [members, setMembers] = useState<WorkspaceMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [showInvite, setShowInvite] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState<WorkspaceRole>('MEMBER');
  const [inviting, setInviting] = useState(false);
  const [deleteDialog, setDeleteDialog] = useState<{ isOpen: boolean; memberId: string | null }>({ isOpen: false, memberId: null });

  const fetchData = useCallback(async () => {
    if (!workspaceId) return;
    try {
      const [wsRes, membersRes] = await Promise.all([
        apiClient.get<Workspace>(`/workspaces/${workspaceId}`),
        apiClient.get<WorkspaceMember[]>(`/workspaces/${workspaceId}/members`)
      ]);
      setWorkspace(wsRes.data);
      setMembers(membersRes.data);
    } catch (err) {
      console.error(err);
      toast.error('Failed to load workspace members');
    } finally {
      setLoading(false);
    }
  }, [workspaceId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteEmail.trim()) return;
    setInviting(true);
    try {
      await apiClient.post(`/workspaces/${workspaceId}/members`, { email: inviteEmail, role: inviteRole });
      toast.success('Member invited successfully!');
      setInviteEmail('');
      setShowInvite(false);
      await fetchData();
    } catch (err: unknown) {
      toast.error(getApiErrorMessage(err, 'Failed to invite member.'));
    } finally {
      setInviting(false);
    }
  };

  const executeRemove = async () => {
    if (!deleteDialog.memberId || !workspaceId) return;
    try {
      await apiClient.delete(`/workspaces/${workspaceId}/members/${deleteDialog.memberId}`);
      toast.success('Member removed successfully');
      await fetchData();
    } catch (err: unknown) {
      toast.error(getApiErrorMessage(err, 'Failed to remove member.'));
    } finally {
      setDeleteDialog({ isOpen: false, memberId: null });
    }
  };

  const canManage = workspace?.myRole === 'OWNER' || workspace?.myRole === 'ADMIN';

  const getRoleBadgeColor = (role: WorkspaceRole) => {
    switch (role) {
      case 'OWNER': return 'bg-status-warningBg text-status-warning border-status-warning/20';
      case 'ADMIN': return 'bg-status-infoBg text-status-info border-status-info/20';
      case 'MEMBER': return 'bg-status-successBg text-status-success border-status-success/20';
      case 'VIEWER': return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-cf-primary" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-cf-border pb-4 gap-4">
        <div>
          <div className="flex items-center space-x-2 text-xs text-cf-textMuted uppercase font-semibold tracking-wider mb-1">
            <Link to="/workspaces" className="hover:text-cf-primary transition">Workspaces</Link>
            <span>/</span>
            <Link to={`/workspaces/${workspaceId}`} className="hover:text-cf-primary transition">{workspace?.name}</Link>
            <span>/</span>
            <span className="text-cf-textDark">Members</span>
          </div>
          <h1 className="text-xl font-bold text-cf-textDark">Workspace Members</h1>
          <p className="text-xs text-cf-textMuted mt-1">{members.length} member{members.length === 1 ? '' : 's'}</p>
        </div>
        <div className="flex gap-2">
          <Link to={`/workspaces/${workspaceId}`}>
            <Button variant="secondary" size="sm">
              <ArrowLeft size={14} className="mr-1" /> Back
            </Button>
          </Link>
          {canManage && (
            <Button onClick={() => setShowInvite(true)} size="sm">
              <UserPlus size={14} className="mr-1" /> Invite Member
            </Button>
          )}
        </div>
      </div>

      <Card>
        <div className="divide-y divide-cf-border">
          {members.map((member) => (
            <div key={member.userId} className="flex items-center justify-between p-4 hover:bg-cf-bgLight/50 transition">
              <div className="flex items-center gap-4">
                <div className="w-9 h-9 bg-cf-primary/10 text-cf-primary rounded-full flex items-center justify-center text-xs font-bold uppercase">
                  {member.email.slice(0, 2)}
                </div>
                <div>
                  <p className="text-sm font-medium text-cf-textDark">{member.email}</p>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className={`text-[9px] uppercase px-1.5 py-0.5 rounded border font-mono ${getRoleBadgeColor(member.role)}`}>
                      {member.role}
                    </span>
                    {member.userId === user?.id && (
                      <span className="text-[9px] text-cf-textMuted">(You)</span>
                    )}
                  </div>
                </div>
              </div>
              {canManage && member.role !== 'OWNER' && (
                <button
                  onClick={() => setDeleteDialog({ isOpen: true, memberId: member.memberId || member.userId })}
                  className="p-2 text-cf-textMuted hover:text-red-600 hover:bg-red-50 rounded transition"
                  aria-label={`Remove ${member.email}`}
                >
                  <Trash2 size={15} />
                </button>
              )}
            </div>
          ))}
        </div>
      </Card>

      {showInvite && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-cf-navy/60 backdrop-blur-sm"
          onClick={() => setShowInvite(false)}
        >
          <Card className="w-full max-w-md shadow-2xl" onClick={(e: React.MouseEvent) => e.stopPropagation()}>
            <CardHeader className="bg-cf-navy text-white">
              <h3 className="font-bold text-base">Invite Member</h3>
              <p className="text-[11px] text-gray-300">Add a user to this workspace by email</p>
            </CardHeader>
            <form onSubmit={handleInvite}>
              <CardBody className="space-y-4">
                <Input
                  label="Email address"
                  type="email"
                  placeholder="colleague@company.com"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  required
                />
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-cf-textMuted mb-1.5">
                    Role
                  </label>
                  <select
                    value={inviteRole}
                    onChange={(e) => setInviteRole(e.target.value as WorkspaceRole)}
                    className="w-full px-3 py-2 text-sm text-cf-textDark bg-white border border-cf-border rounded focus:outline-none focus:border-cf-primary focus:ring-1 focus:ring-cf-primary transition"
                  >
                    {ROLES.map((r) => (
                      <option key={r} value={r}>{r}</option>
                    ))}
                  </select>
                </div>
              </CardBody>
              <div className="px-5 py-4 border-t border-cf-border bg-cf-bgLight/40 flex items-center justify-end gap-3">
                <Button type="button" variant="ghost" size="sm" onClick={() => setShowInvite(false)} disabled={inviting}>
                  Cancel
                </Button>
                <Button type="submit" size="sm" disabled={inviting}>
                  {inviting ? 'Inviting...' : 'Send Invite'}
                </Button>
              </div>
            </form>
          </Card>
        </div>
      )}

      <ConfirmDialog
        isOpen={deleteDialog.isOpen}
        title="Remove Member"
        message="Are you sure you want to remove this member from the workspace? They will lose access to all projects and tasks."
        confirmLabel="Remove"
        isDestructive
        onConfirm={executeRemove}
        onCancel={() => setDeleteDialog({ isOpen: false, memberId: null })}
      />
    </div>
  );
};

export default WorkspaceMembers;