import { useAppStore } from '../store/useAppStore';
import { PageContainer } from '../components/ui/PageContainer';
import { PageHeader } from '../components/ui/PageHeader';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/card';
import { Label } from '../components/ui/label';
import { Switch } from '../components/ui/switch';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '../components/ui/select';
import { 
  Moon, 
  Sun, 
  Monitor, 
  Bell, 
  Globe,
  Lock as LockIcon
} from 'lucide-react';
import { toast } from 'sonner';
import { Badge } from '../components/ui/badge';

export default function Settings() {
  const { settings, updateSettings } = useAppStore();

  const handleToggle = (key: keyof typeof settings, value: boolean) => {
    updateSettings({ [key]: value });
    toast.info(`Setting updated: ${key.charAt(0).toUpperCase() + key.slice(1).replace(/([A-Z])/g, ' $1')}`, {
      description: value ? 'Feature enabled' : 'Feature disabled',
    });
  };

  const handleThemeChange = (value: 'light' | 'dark' | 'system') => {
    updateSettings({ theme: value });
    toast.info(`Theme changed to ${value}`);
  };

  return (
    <PageContainer variant="narrow">
      <PageHeader 
        title="Settings"
        subtitle="Customize your AgileTrack workspace experience"
      />

      <div className="space-y-6">
        {/* Appearance */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sun className="w-5 h-5 text-primary" /> Appearance
            </CardTitle>
            <CardDescription>
              Personalize how AgileTrack looks on your device.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label className="text-sm font-semibold">Theme Preference</Label>
                <p className="text-xs text-muted-foreground">Select your interface color scheme.</p>
              </div>
              <Select value={settings.theme} onValueChange={handleThemeChange}>
                <SelectTrigger className="w-[140px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="light" className="flex items-center gap-2">
                    <Sun className="w-4 h-4 mr-2 inline" /> Light
                  </SelectItem>
                  <SelectItem value="dark" className="flex items-center gap-2">
                    <Moon className="w-4 h-4 mr-2 inline" /> Dark
                  </SelectItem>
                  <SelectItem value="system" className="flex items-center gap-2">
                    <Monitor className="w-4 h-4 mr-2 inline" /> System
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label className="text-sm font-semibold flex items-center gap-2 text-foreground">
                  Compact Mode
                </Label>
                <p className="text-xs text-muted-foreground">Reduce spacing to show more content at once.</p>
              </div>
              <Switch 
                checked={settings.compactMode}
                onCheckedChange={(val) => handleToggle('compactMode', val)}
              />
            </div>
          </CardContent>
        </Card>

        {/* Notifications */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="w-5 h-5 text-primary" /> Notifications
            </CardTitle>
            <CardDescription>
              Choose how you want to be alerted about project updates.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label className="text-sm font-semibold">Email Notifications</Label>
                <p className="text-xs text-muted-foreground">Receive daily digests and priority alerts.</p>
              </div>
              <Switch 
                checked={settings.notifications}
                onCheckedChange={(val) => handleToggle('notifications', val)}
              />
            </div>
          </CardContent>
        </Card>

        {/* Other Settings (Mock) */}
        <Card className="opacity-60 grayscale-[0.5]">
          <CardHeader>
            <CardTitle className="text-sm font-semibold">Additional Preferences</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-3 text-sm text-muted">
              <Globe className="w-4 h-4" /> Language & Region
              <Badge variant="outline" className="ml-auto text-[10px]">English (US)</Badge>
            </div>
            <div className="flex items-center gap-3 text-sm text-muted">
              <LockIcon className="w-4 h-4" /> Security & Privacy
              <Badge variant="outline" className="ml-auto text-[10px]">Managed</Badge>
            </div>
          </CardContent>
        </Card>
      </div>
    </PageContainer>
  );
}
