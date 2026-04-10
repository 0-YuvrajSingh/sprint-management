import { Camera, Loader2, Mail, Save, Shield, User } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { PageContainer } from '../components/ui/PageContainer';
import { PageHeader } from '../components/ui/PageHeader';
import { Avatar, AvatarFallback, AvatarImage } from '../components/ui/avatar';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { useAppStore } from '../store/useAppStore';

export default function Profile() {
  const { user, updateUser } = useAppStore();
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState({
    name: user.name,
    email: user.email,
    role: user.role,
  });

  useEffect(() => {
    setFormData({
      name: user.name,
      email: user.email,
      role: user.role,
    });
  }, [user.email, user.name, user.role]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000));

    updateUser(formData);
    setIsSaving(false);
    toast.success('Profile updated successfully');
  };

  return (
    <PageContainer variant="narrow">
      <PageHeader
        title="Profile Settings"
        subtitle="Manage your personal information and preferences"
      />

      <div className="space-y-6">
        {/* Avatar Section */}
        <Card className="overflow-hidden border-primary/10">
          <CardContent className="p-0">
            <div className="h-32 bg-gradient-to-r from-primary/20 via-primary/5 to-background" />
            <div className="px-6 pb-6 -mt-12 flex flex-col sm:flex-row items-end gap-4">
              <div className="relative group">
                <Avatar className="w-24 h-24 border-4 border-background shadow-xl">
                  <AvatarImage src={user.avatar} />
                  <AvatarFallback className="text-2xl">{user.name.charAt(0)}</AvatarFallback>
                </Avatar>
                <Button
                  size="icon"
                  variant="secondary"
                  className="absolute bottom-0 right-0 rounded-full w-8 h-8 shadow-md hover:scale-110 transition-transform"
                >
                  <Camera className="w-4 h-4" />
                </Button>
              </div>
              <div className="flex-1 space-y-1 mb-1">
                <h3 className="text-xl font-bold">{user.name}</h3>
                <div className="flex items-center gap-2">
                  <Badge variant="secondary" className="px-2 py-0">
                    {user.role}
                  </Badge>
                  <span className="text-xs text-muted-foreground">User ID: {user.id}</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Form Section */}
        <Card>
          <CardHeader>
            <CardTitle>Personal Information</CardTitle>
            <CardDescription>
              Update your name and contact details used across AgileTrack.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSave} className="space-y-6">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="name" className="flex items-center gap-2">
                    <User className="w-4 h-4 text-muted-foreground" /> Full Name
                  </Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="John Doe"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email" className="flex items-center gap-2">
                    <Mail className="w-4 h-4 text-muted-foreground" /> Email Address
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                    placeholder="john@example.com"
                    required
                  />
                </div>
                <div className="space-y-2 sm:col-span-2">
                  <Label htmlFor="role" className="flex items-center gap-2">
                    <Shield className="w-4 h-4 text-muted-foreground" /> Role
                  </Label>
                  <Input
                    id="role"
                    value={formData.role}
                    onChange={(e) => setFormData(prev => ({ ...prev, role: e.target.value }))}
                    placeholder="Senior Developer"
                    disabled
                  />
                  <p className="text-[10px] text-muted-foreground italic">
                    Role management is controlled by your organization administrator.
                  </p>
                </div>
              </div>

              <div className="flex justify-end pt-4 border-t">
                <Button type="submit" disabled={isSaving} className="gap-2">
                  {isSaving ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4" />
                      Save Changes
                    </>
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Danger Zone */}
        <Card className="border-destructive/20 bg-destructive/5">
          <CardHeader>
            <CardTitle className="text-destructive">Danger Zone</CardTitle>
            <CardDescription>
              Actions that can permanently affect your account.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button variant="destructive" className="border-destructive/30 hover:bg-destructive/10 text-destructive bg-transparent hover:text-destructive">
              Deactivate Account
            </Button>
          </CardContent>
        </Card>
      </div>
    </PageContainer>
  );
}
