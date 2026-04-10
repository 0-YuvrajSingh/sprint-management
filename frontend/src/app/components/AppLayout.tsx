import {
    Activity,
    Bell,
    ChevronDown,
    FolderKanban,
    Kanban,
    LayoutDashboard,
    LogOut,
    Menu,
    Search,
    Settings,
    Timer,
    User as UserIcon,
    Users,
    X,
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router';
import { useAuth } from '../context/AuthContext';
import { useAppStore } from '../store/useAppStore';
import { Logo } from './Logo';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from './ui/dropdown-menu';
import { Input } from './ui/input';

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard, roles: ['ADMIN', 'MANAGER', 'DEVELOPER', 'VIEWER'] },
  { name: 'Projects', href: '/projects', icon: FolderKanban, roles: ['ADMIN', 'MANAGER', 'DEVELOPER', 'VIEWER'] },
  { name: 'Sprints', href: '/sprints', icon: Timer, roles: ['ADMIN', 'MANAGER', 'DEVELOPER', 'VIEWER'] },
  { name: 'Stories', href: '/stories', icon: Kanban, roles: ['ADMIN', 'MANAGER', 'DEVELOPER', 'VIEWER'] },
  { name: 'Activity', href: '/activity', icon: Activity, roles: ['ADMIN', 'MANAGER', 'DEVELOPER', 'VIEWER'] },
  { name: 'Users', href: '/users', icon: Users, roles: ['ADMIN', 'MANAGER'] },
];

const secondaryNavigation = [
  { name: 'Profile', href: '/profile', icon: UserIcon },
  { name: 'Settings', href: '/settings', icon: Settings },
];

export function AppLayout() {
  const { user, logout, hasRole } = useAuth();
  const syncDomainData = useAppStore((state) => state.syncDomainData);
  const isSyncing = useAppStore((state) => state.isSyncing);
  const syncError = useAppStore((state) => state.syncError);
  const lastSyncedForUser = useAppStore((state) => state.lastSyncedForUser);
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    if (!user) {
      void syncDomainData(null);
      return;
    }

    if (lastSyncedForUser === user.id) {
      return;
    }

    void syncDomainData(user);
  }, [lastSyncedForUser, syncDomainData, user]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const filteredNavigation = navigation.filter((item) =>
    hasRole(item.roles as any[])
  );

  const isActive = (href: string) => {
    if (href === '/dashboard') {
      return location.pathname === href;
    }
    return location.pathname.startsWith(href);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Sidebar - Desktop */}
      <aside className="fixed inset-y-0 left-0 z-50 w-64 bg-card border-r hidden lg:block">
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="h-16 flex items-center px-8 border-b">
            <Link to="/">
              <Logo />
            </Link>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
            {filteredNavigation.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.href);
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`relative flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 group ${
                    active
                      ? 'bg-primary/10 text-primary'
                      : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                  }`}
                >
                  {active && (
                    <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-primary rounded-r-full" />
                  )}
                  <Icon className={`w-5 h-5 ${active ? '' : 'group-hover:scale-110 transition-transform'}`} />
                  {item.name}
                </Link>
              );
            })}
          </nav>

          {/* Secondary Navigation */}
          <div className="px-3 pb-4 space-y-1">
            {secondaryNavigation.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.href);
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 group ${
                    active
                      ? 'bg-primary/10 text-primary'
                      : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                  }`}
                >
                  <Icon className={`w-5 h-5 ${active ? '' : 'group-hover:text-primary transition-colors'}`} />
                  {item.name}
                </Link>
              );
            })}
          </div>

          {/* User profile in sidebar */}
          <div className="p-4 border-t">
            <div className="flex items-center gap-3">
              <Avatar className="w-9 h-9 border">
                <AvatarImage src={user?.avatar} />
                <AvatarFallback>{user?.name.charAt(0)}</AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground truncate">{user?.name}</p>
                <p className="text-xs text-muted-foreground truncate">{user?.role}</p>
              </div>
            </div>
          </div>
        </div>
      </aside>

      {/* Mobile sidebar */}
      {sidebarOpen && (
        <>
          <div
            className="fixed inset-0 z-40 bg-black/50 lg:hidden backdrop-blur-sm"
            onClick={() => setSidebarOpen(false)}
          />
          <aside className="fixed inset-y-0 left-0 z-50 w-64 bg-card border-r lg:hidden">
            <div className="flex flex-col h-full">
              <div className="h-16 flex items-center justify-between px-8 border-b">
                <Link to="/">
                  <Logo />
                </Link>
                <Button variant="ghost" size="icon" onClick={() => setSidebarOpen(false)}>
                  <X className="w-5 h-5" />
                </Button>
              </div>

              <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
                {filteredNavigation.map((item) => {
                  const Icon = item.icon;
                  const active = isActive(item.href);
                  return (
                    <Link
                      key={item.name}
                      to={item.href}
                      onClick={() => setSidebarOpen(false)}
                      className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-150 ${
                        active
                          ? 'bg-primary/10 text-primary'
                          : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                      }`}
                    >
                      <Icon className="w-5 h-5" />
                      {item.name}
                    </Link>
                  );
                })}
              </nav>

              <div className="p-4 border-t">
                <div className="flex items-center gap-3">
                  <Avatar className="w-9 h-9 border">
                    <AvatarImage src={user?.avatar} />
                    <AvatarFallback>{user?.name.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">{user?.name}</p>
                    <p className="text-xs text-muted-foreground truncate">{user?.role}</p>
                  </div>
                </div>
              </div>
            </div>
          </aside>
        </>
      )}

      {/* Main content */}
      <div className="lg:pl-64">
        {/* Top bar */}
        <header className="sticky top-0 z-30 h-16 bg-card/80 backdrop-blur-lg border-b">
          <div className="h-full px-8 flex items-center justify-between gap-4">
            {/* Mobile menu button */}
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden"
              onClick={() => setSidebarOpen(true)}
            >
              <Menu className="w-5 h-5" />
            </Button>

            {/* Search */}
            <div className="flex-1 max-w-xl">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Search projects, stories..."
                  className="pl-10"
                />
              </div>
            </div>

            {/* Right side actions */}
            <div className="flex items-center gap-2">
              {isSyncing && (
                <Badge variant="secondary" className="hidden md:inline-flex">
                  Syncing...
                </Badge>
              )}
              {syncError && !isSyncing && (
                <Badge variant="destructive" className="hidden xl:inline-flex" title={syncError}>
                  Sync issue
                </Badge>
              )}

              {/* Notifications */}
              <Button variant="ghost" size="icon" className="relative">
                <Bell className="w-5 h-5" />
                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-primary rounded-full" />
              </Button>

              {/* User menu */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="gap-2 px-2 hover:bg-muted">
                    <Avatar className="w-7 h-7 border">
                      <AvatarImage src={user?.avatar} />
                      <AvatarFallback className="text-xs">{user?.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <span className="hidden sm:inline text-sm font-medium">{user?.name}</span>
                    <ChevronDown className="w-4 h-4 text-muted-foreground" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <div className="px-2 py-2">
                    <p className="text-sm font-medium">{user?.name}</p>
                    <p className="text-xs text-muted-foreground">{user?.email}</p>
                    <Badge variant="secondary" className="mt-2 text-xs">
                      {user?.role}
                    </Badge>
                  </div>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link to="/profile" className="flex items-center w-full">
                      <UserIcon className="w-4 h-4 mr-2" />
                      Profile
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link to="/settings" className="flex items-center w-full">
                      <Settings className="w-4 h-4 mr-2" />
                      Settings
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout} className="text-destructive">
                    <LogOut className="w-4 h-4 mr-2" />
                    Logout
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="min-h-[calc(100vh-4rem)]">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
